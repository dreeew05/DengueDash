from rest_framework import serializers


class WeatherDataSerializer(serializers.Serializer):
    rainfall = serializers.FloatField()
    max_temperature = serializers.FloatField()
    humidity = serializers.FloatField()


class PredictionRequestSerializer(serializers.Serializer):
    future_weather = WeatherDataSerializer(many=True)


class ModelTrainingSerializer(serializers.Serializer):
    window_size = serializers.IntegerField(
        required=False,
        default=10,
        min_value=5,
        max_value=20,
    )
    validation_split = serializers.FloatField(
        required=False,
        default=0.2,
        min_value=0.05,
        max_value=0.5,
    )
    epochs = serializers.IntegerField(
        required=False,
        default=100,
        min_value=1,
        max_value=1000,
    )
    batch_size = serializers.IntegerField(
        required=False,
        default=1,
        min_value=1,
        max_value=256,
    )
    learning_rate = serializers.FloatField(
        required=False,
        default=0.001,
        min_value=0.0001,
        max_value=0.1,
    )
