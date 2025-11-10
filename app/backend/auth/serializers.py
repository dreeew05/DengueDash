from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.custom_exceptions.custom_validation_exception import CustomValidationException
from user.serializers import BaseUserSerializer


User = get_user_model()


class LoginSerializer(TokenObtainPairSerializer):
    dru = serializers.StringRelatedField()

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

        # Unverified users cannot login
        if not user.is_verified:
            raise CustomValidationException(
                "Account is not verified. Please wait for admin approval"
            )

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        access_token = AccessToken.for_user(user)
        is_user_admin = user.is_admin
        user_dru_type = user.dru.dru_type.dru_classification
        # Additional data appended to the token
        access_token["is_admin"] = is_user_admin
        access_token["user_dru_type"] = user_dru_type
        data["access"] = str(access_token)

        # Append user data
        user_data = BaseUserSerializer(user).data
        data["user_data"] = user_data
        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh_token = attrs.get("refresh")
        if not refresh_token:
            raise CustomValidationException("Refresh token is required.")

        try:
            decoded_refresh = RefreshToken(refresh_token)
            user_id = decoded_refresh["user_id"]
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise CustomValidationException("User not found.")
        except KeyError:
            raise CustomValidationException("Invalid token.")

        access_token = AccessToken(data["access"])
        access_token["is_admin"] = user.is_admin
        access_token["user_dru_type"] = user.dru.dru_type.dru_classification
        data["access"] = str(access_token)

        return data
