from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.custom_exceptions.custom_validation_exception import CustomValidationException
from user.models import UserClassification
from dru.models import DRU, DRUType


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
    )
    classification = serializers.PrimaryKeyRelatedField(
        queryset=UserClassification.objects.all(),
        required=True,
    )

    dru = serializers.PrimaryKeyRelatedField(
        queryset=DRU.objects.all(),
        required=False,
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password_confirm",
            "first_name",
            "middle_name",
            "last_name",
            "sex",
            "dru",
            "classification",
        ]

    """
    Todo: Super Admins should register Admins
    Todo: Admins should register Users

    Todo: Admins should register nominated DRUs
    """

    def validate(self, attrs):
        # Todo: Refactor in the future
        if attrs["classification"] == UserClassification.objects.get(
            classification="super_admin"
        ):
            raise serializers.ValidationError(
                {"classification": "Invalid Classification."}
            )

        # Appropriate Classification for DRU type
        if attrs["classification"] == UserClassification.objects.get(
            classification="admin_region"
        ) and attrs["dru"].dru_type != DRUType.objects.get(
            dru_classification="RESU",
        ):
            raise serializers.ValidationError(
                {
                    "dru": "Invalid DRU type for Regional Admin Account",
                }
            )

        if attrs["classification"] == UserClassification.objects.get(
            classification="admin_local"
        ) and attrs["dru"].dru_type != DRUType.objects.get(
            dru_classification="PESU/CESU",
        ):
            raise serializers.ValidationError(
                {"dru": "Invalid DRU type for PESU/CESU Admin Account"},
            )

        # Todo: Save for future use
        # if attrs["classification"] == UserClassification.objects.get(
        #     classification="encoder"
        # ) and (
        #     attrs["dru"].dru_type == DRUType.objects.get(dru_classification="PESU/CESU")
        #     or attrs["dru"].dru_type == DRUType.objects.get(dru_classification="RESU")
        # ):
        #     raise serializers.ValidationError(
        #         {"dru": "Invalid DRU type for Encoder Account"},
        #     )

        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        return User.objects.create_user(
            password=password,
            **validated_data,
        )


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        if request := self.context.get("request"):
            attrs["username"] = request.data.get("email")

        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            raise CustomValidationException(
                "No active account found with the given credentials"
            )
        except Exception:
            raise CustomValidationException(
                "An unexpected error occurred during login."
            )
        user = self.user
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        # Modify the default access token by including the user_type
        access_token = AccessToken.for_user(user)
        user_type = user.classification.classification
        access_token["user_type"] = user_type
        data["access"] = str(access_token)
        return data
