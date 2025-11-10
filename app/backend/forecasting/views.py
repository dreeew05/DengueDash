from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np
import pandas as pd
import os
import math
import random
from datetime import datetime, timedelta
from .serializers import (
    PredictionRequestSerializer,
    ModelTrainingSerializer,
)
from case.models import Case
from case.views.case_report_view import fetch_cases_for_week
from weather.models import Weather
import shutil
import json
from django.http import JsonResponse
from auth.permission import IsUserAdmin
from django.db.models import Count


class LstmTrainingView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsUserAdmin)

    def __init__(self):
        super().__init__()
        self.model_dir = os.path.join(os.path.dirname(__file__), "ml-dl-models")
        self.model_path = None
        self.metadata_path = None

        # Ensure directory exists
        os.makedirs(self.model_dir, exist_ok=True)

        # Metdadata
        self.dataset_length = 0

        self.scaler_features = MinMaxScaler()
        self.scaler_target = MinMaxScaler()

        self.normalized_data = None
        self.normalized_target = None

        self.location_filter = None
        self.weather_filter = None

        self.admin_location = None

    def initialize_paths_filters(self, request):
        user = request.user
        dru_type = str(user.dru.dru_type)
        if dru_type == "RESU":
            self.location_filter = {"interviewer__dru__region": str(user.dru.region)}
            self.weather_filter = {
                "location": str(user.dru.region),
            }
            self.admin_location = str(user.dru.region).replace(" ", "_").lower()
        elif dru_type in ["PESU", "CESU"]:
            self.location_filter = {
                "interviewer__dru__surveillance_unit": str(user.dru.surveillance_unit)
            }
            self.admin_location = (
                str(user.dru.surveillance_unit)
                .replace(
                    " ",
                    "_",
                )
                .lower()
            )
            if dru_type == "PESU":
                self.weather_filter = {
                    "location": str(user.dru.addr_province),
                }
            else:
                self.weather_filter = {
                    "location": str(user.dru.addr_city),
                }
        # todo: handle National data
        # elif dru_type == "National":
        #     self.location_filter = {}

        self.model_path = os.path.join(
            self.model_dir,
            f"dengue_lstm_model_{self.admin_location}.keras",
        )
        self.metadata_path = os.path.join(
            self.model_dir,
            f"model_metadata_{self.admin_location}.json",
        )

    def get_features_target(self):
        # todo: base the end_date to the last date_con in cases
        # todo: if weather does not exist, fetch from OpenWeatherAPI
        weather_records = Weather.objects.filter(
            **self.weather_filter,
        ).order_by("start_day")

        features_dataset = []
        target_dataset = []

        for week in weather_records:
            cases_for_week = fetch_cases_for_week(
                week.start_day,
                self.location_filter,
            )

            features_dataset.append(
                [
                    week.weekly_rainfall,
                    week.weekly_temperature,
                    week.weekly_humidity,
                ]
            )
            target_dataset.append(cases_for_week)

        # For Metdata
        self.dataset_length = len(features_dataset)

        return np.array(features_dataset), np.array(target_dataset)

    def normalize_data(self):
        features, target = self.get_features_target()

        normalized_features = self.scaler_features.fit_transform(features)
        self.normalized_target = self.scaler_target.fit_transform(target.reshape(-1, 1))

        self.normalized_data = pd.DataFrame(
            normalized_features,
            columns=["Rainfall", "Temperature", "Humidity"],
        )
        self.normalized_data["Cases"] = self.normalized_target

    def set_seeds(self, seed=42):
        # Set seed for reproducibility
        os.environ["PYTHONHASHSEED"] = str(seed)
        random.seed(seed)
        np.random.seed(seed)
        tf.random.set_seed(seed)
        os.environ["TF_DETERMINISTIC_OPS"] = "1"
        os.environ["TF_CUDNN_DETERMINISTIC"] = "1"

    def create_sequences(
        self,
        data,
        target,
        window_size,
    ):
        X, y = [], []
        for i in range(window_size, len(data)):
            X.append(data[i - window_size : i])
            y.append(target[i])
        return np.array(X), np.array(y)

    def train_model_with_validation(
        self,
        window_size=5,
        validation_split=0.2,
        epochs=100,
        batch_size=1,
        learning_rate=0.001,
    ):
        # Fetch and normalize data
        self.normalize_data()

        self.set_seeds()

        X, y = self.create_sequences(
            self.normalized_data.values,
            self.normalized_target,
            window_size,
        )

        split_index = int(len(X) * (1 - validation_split))
        X_train, X_test = X[:split_index], X[split_index:]
        y_train, y_test = y[:split_index], y[split_index:]

        model = Sequential()
        # Input Layer
        model.add(Input(shape=(X_train.shape[1], X_train.shape[2])))
        model.add(
            LSTM(
                64,
                activation="relu",
                kernel_initializer=tf.keras.initializers.GlorotUniform(seed=42),
                recurrent_initializer=tf.keras.initializers.Orthogonal(seed=42),
            )
        )
        model.add(
            Dense(1, kernel_initializer=tf.keras.initializers.GlorotUniform(seed=42))
        )  # Output layer to predict dengue cases

        # Compile the model with Adam optimizer and custom learning rate

        optimizer = Adam(learning_rate=learning_rate)
        model.compile(optimizer=optimizer, loss="mean_squared_error")

        # Early stopping callback
        early_stopping = EarlyStopping(
            monitor="val_loss", patience=5, restore_best_weights=True
        )

        # Train the model
        history = model.fit(
            X_train,
            y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_test, y_test),
            verbose=1,
            callbacks=[early_stopping],
        )

        # Predict on test set
        y_pred = model.predict(X_test)

        # Rescale back to original dengue case values
        predicted_actual_scale = self.scaler_target.inverse_transform(y_pred)
        y_test_actual_scale = self.scaler_target.inverse_transform(y_test)

        # Compute MSE and RMSE
        mse = mean_squared_error(
            y_test_actual_scale,
            predicted_actual_scale,
        )
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(
            y_test_actual_scale,
            predicted_actual_scale,
        )
        r2 = r2_score(
            y_test_actual_scale,
            predicted_actual_scale,
        )

        # Create metadata
        metadata = {
            "window_size": window_size,
            "last_trained": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "dataset_size": self.dataset_length,
            "metrics": {
                "mse": float(mse),
                "rmse": float(rmse),
                "mae": float(mae),
                "r2": float(r2),
            },
            "epochs_completed": len(history.history["loss"]),
        }

        temp_model_path, temp_metadata_path = self.save_temp_model_metadata(
            model, metadata
        )

        return {
            "success": True,
            "metrics": metadata["metrics"],
            "dataset_size": metadata["dataset_size"],
            "window_size": metadata["window_size"],
            "epochs_completed": metadata["epochs_completed"],
            "temp_model_path": temp_model_path,
            "temp_metadata_path": temp_metadata_path,
        }

    def save_temp_model_metadata(
        self,
        model,
        metadata,
    ):
        # Save model and metadata to temporary location
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_model_path = os.path.join(
            self.model_dir, f"temp_model_{self.admin_location}_{timestamp}.keras"
        )
        temp_metadata_path = os.path.join(
            self.model_dir, f"temp_metadata_{self.admin_location}_{timestamp}.json"
        )
        model.save(temp_model_path)

        with open(temp_metadata_path, "w") as f:
            json.dump(metadata, f)

        return temp_model_path, temp_metadata_path

    def backup_existing_model(self):
        """Create a backup of the existing model if it exists"""
        backup_info = {"model_backed_up": False}

        if os.path.exists(self.model_path):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_model_path = os.path.join(
                self.model_dir,
                f"dengue_lstm_model_backup_{self.admin_location}_{timestamp}.keras",
            )
            backup_metadata_path = os.path.join(
                self.model_dir,
                f"model_metadata_backup_{self.admin_location}_{timestamp}.json",
            )

            # Copy model and metadata to backup
            shutil.copy2(self.model_path, backup_model_path)

            if os.path.exists(self.metadata_path):
                shutil.copy2(self.metadata_path, backup_metadata_path)

            backup_info = {
                "model_backed_up": True,
                "backup_model_path": backup_model_path,
                "backup_metadata_path": backup_metadata_path,
            }

        return backup_info

    def commit_model(self, temp_model_path, temp_metadata_path):
        """Commit the temporary model to become the main model"""
        # Move temporary model to the main model path
        shutil.copy2(temp_model_path, self.model_path)
        shutil.copy2(temp_metadata_path, self.metadata_path)

        # Clean up temporary files
        os.remove(temp_model_path)
        os.remove(temp_metadata_path)

        return True

    def post(self, request):
        try:
            serializer = ModelTrainingSerializer(data=request.data)

            if not serializer.is_valid():
                return JsonResponse(
                    {
                        "success": False,
                        "message": serializer.errors,
                    }
                )

            self.initialize_paths_filters(request)

            window_size = serializer.validated_data.get("window_size", 5)
            validation_split = serializer.validated_data.get("validation_split", 0.2)
            epochs = serializer.validated_data.get("epochs", 100)
            batch_size = serializer.validated_data.get("batch_size", 1)
            learning_rate = serializer.validated_data.get("learning_rate", 0.001)

            # Only backup existing model if needed
            backup_info = self.backup_existing_model()

            # Train new model and save to temporary location
            training_result = self.train_model_with_validation(
                window_size,
                validation_split,
                epochs,
                batch_size,
                learning_rate,
            )

            if not training_result["success"]:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Model training failed.",
                    }
                )

            metrics = training_result["metrics"]

            existing_model_metrics = None
            if os.path.exists(self.metadata_path):
                with open(self.metadata_path, "r") as f:
                    existing_metadata = json.load(f)
                    existing_model_metrics = existing_metadata.get("metrics", {})

            # Make decision to commit model based on metrics
            # For example, only commit if the new model has better R² or lower RMSE
            should_commit = True
            commit_reason = "New model trained successfully"

            # todo: might implement
            # todo: determine if this is a good idead
            # todo: consult with sir Dimzon
            # todo: purspose only commit if R^2 or RMSE is better than the previously generated training
            # if existing_model_metrics:
            #     # Example: Only commit if R² is better or same but RMSE is lower
            #     if metrics["r2"] >= existing_model_metrics["r2"] or (
            #         metrics["r2"]
            #         >= existing_model_metrics["r2"] * 0.95  # Within 5% of previous R²
            #         and metrics["rmse"] < existing_model_metrics["rmse"]
            #     ):
            #         commit_reason = (
            #             "New model has better or comparable performance metrics"
            #         )
            #     else:
            #         should_commit = False
            #         commit_reason = "New model metrics are worse than existing model"

            response_data = {
                "training_completed": True,
                "metrics": metrics,
                "previous_model_metrics": existing_model_metrics,
                "dataset_size": training_result["dataset_size"],
                "window_size": training_result["window_size"],
                "epochs_completed": training_result["epochs_completed"],
                "model_committed": should_commit,
                "commit_reason": commit_reason,
                "backup_info": backup_info if backup_info["model_backed_up"] else None,
            }

            # Only commit if decided to do so
            if should_commit:
                self.commit_model(
                    training_result["temp_model_path"],
                    training_result["temp_metadata_path"],
                )
            else:
                # Clean up temporary files without committing
                os.remove(training_result["temp_model_path"])
                os.remove(training_result["temp_metadata_path"])

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LstmPredictionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def __init__(self):
        self.model_dir = os.path.join(os.path.dirname(__file__), "ml-dl-models")

        self.model_path = None
        self.metadata_path = None
        self.user_location = None
        self.model = None
        self.window_size = None

        self.model_metadata = {}

        self.scaler_features = MinMaxScaler()
        self.scaler_target = MinMaxScaler()
        self.scaler_future_weather = MinMaxScaler()

        self.location_filter = None
        self.weather_filter = None

    def get_latest_week_number(self):
        cases = Case.objects.latest("date_con").date_con
        return cases.isocalendar().week

    def initialize_window_size(self, window_size):
        self.window_size = window_size

    def initialize_paths_filters(self, request):
        user = request.user
        dru_type = str(user.dru.dru_type)
        if dru_type == "RESU":
            self.location_filter = {"interviewer__dru__region": str(user.dru.region)}
            self.weather_filter = {
                "location": str(user.dru.region),
            }
            self.user_location = str(user.dru.region).replace(" ", "_").lower()
        elif dru_type != "National":
            self.location_filter = {
                "interviewer__dru__surveillance_unit": str(user.dru.surveillance_unit)
            }
            self.user_location = (
                str(user.dru.surveillance_unit).replace(" ", "_").lower()
            )
            if dru_type == "PESU":
                self.weather_filter = {
                    "location": str(user.dru.addr_province),
                }
            else:
                self.weather_filter = {
                    "location": str(user.dru.addr_city),
                }
        # Todo: handle National data
        # elif dru_type == "National":
        #     self.location_filter = {}

        self.model_path = os.path.join(
            self.model_dir,
            f"dengue_lstm_model_{self.user_location}.keras",
        )
        self.metadata_path = os.path.join(
            self.model_dir,
            f"model_metadata_{self.user_location}.json",
        )

        # Load the model
        if os.path.exists(self.model_path):
            self.model = tf.keras.models.load_model(self.model_path)
        else:
            raise Exception(
                "Model not found. Please train the model first.",
            )

        # Initialize the window size based on the model's metadata
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r") as f:
                file_metadata = json.load(f)
                window_size = file_metadata.get("window_size", 10)
                self.initialize_window_size(window_size)
                self.model_metadata["last_trained"] = file_metadata.get(
                    "last_trained", "Unknown"
                )
                self.model_metadata["metrics"] = file_metadata.get("metrics", {})
        else:
            raise Exception(
                "Model metadata not found. Please train the model first.",
            )

    def create_X_sequence(self, data):
        X = []
        for i in range(self.window_size, len(data)):
            X.append(data[i - self.window_size : i])
        return np.array(X)

    def predict_n_weeks(
        self,
        sequence,
        normalized_future_weather,
        n_weeks=2,
    ):

        predictions = []

        for i in range(n_weeks):
            pred_normalized_scalar = self.model.predict(
                sequence.reshape(1, self.window_size, -1)
            )[0][0]

            actual_pred = self.scaler_target.inverse_transform(
                [[pred_normalized_scalar]]
            )[0][0]
            predictions.append(actual_pred)

            current_step_normalized_features = normalized_future_weather[i]

            new_observation_normalized = np.concatenate(
                (
                    current_step_normalized_features,
                    np.array([pred_normalized_scalar]),
                )
            )

            # Shift the sequence to the left
            # Update the sequence with the new observation
            sequence = np.roll(sequence, -1, axis=0)
            sequence[-1] = new_observation_normalized

        # Return the predictions in json format
        predictons_dict = []
        current_week_number = self.get_latest_week_number()
        for i in range(len(predictions)):
            predictons_dict.append(
                {
                    "week": ((current_week_number + i) % 52) + 1,
                    "predicted_cases": math.ceil(predictions[i]),
                    "confidence_interval": {
                        "lower": math.ceil(predictions[i] * 0.9),
                        "upper": math.ceil(predictions[i] * 1.1),
                    },
                }
            )

        return predictons_dict

    def post(self, request):
        try:
            serializer = PredictionRequestSerializer(data=request.data)

            if not serializer.is_valid():
                return JsonResponse(
                    {
                        "success": False,
                        "message": serializer.errors,
                    }
                )

            self.initialize_paths_filters(request)

            # Get the data from the request
            future_weather_dict = serializer.validated_data.get("future_weather")
            future_weather = []
            for week in future_weather_dict:
                future_weather.append(
                    [
                        week["rainfall"],
                        week["max_temperature"],
                        week["humidity"],
                    ]
                )

            weather_data = Weather.objects.filter(
                **self.weather_filter,
            ).order_by("-start_day")
            weather_data = list(reversed(weather_data))

            features_last_n_weeks = np.empty((0, 3))
            target_last_n_weeks = np.empty((0, 1))
            future_weather = np.array(future_weather)

            for week in weather_data:
                cases_for_week = fetch_cases_for_week(
                    week.start_day,
                    self.location_filter,
                )

                # Append features
                features_last_n_weeks = np.append(
                    features_last_n_weeks,
                    [
                        [
                            week.weekly_rainfall,
                            week.weekly_temperature,
                            week.weekly_humidity,
                        ]
                    ],
                    axis=0,
                )

                # Append target
                target_last_n_weeks = np.append(
                    target_last_n_weeks, [[cases_for_week]], axis=0
                )

            normalized_features = self.scaler_features.fit_transform(
                features_last_n_weeks
            )
            normalized_target = self.scaler_target.fit_transform(
                target_last_n_weeks.reshape(-1, 1)
            )
            normalized_future_weather = self.scaler_future_weather.fit_transform(
                future_weather
            )

            normalized_data = np.hstack(
                [
                    normalized_features[-self.window_size :],
                    normalized_target[-self.window_size :],
                ]
            )

            predicted_cases = self.predict_n_weeks(
                normalized_data,
                normalized_future_weather,
            )

            # Add start date
            for i, pred in enumerate(predicted_cases):
                pred["date"] = (
                    weather_data[-1].start_day + timedelta(weeks=i + 1)
                ).strftime("%Y-%m-%d")

            # Get model metadata
            self.model_metadata = {
                "window_size": self.window_size,
                "prediction_generated_at": datetime.now().strftime("%Y-%m-%d-%H-%M-%S"),
            }

            return JsonResponse(
                {
                    "predictions": predicted_cases,
                    "metadata": self.model_metadata,
                }
            )

        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": str(e),
                },
            )
