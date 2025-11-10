from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from auth.serializers import (
    LoginSerializer,
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        # Instantiate the serializer with request data
        serializer_instance = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer_instance.is_valid(raise_exception=True)
        data = serializer_instance.validated_data
        access_token = data.get("access")
        refresh_token = data.get("refresh")

        res = JsonResponse(
            {
                "success": True,
                "message": "Logged in successfully",
                # todo: remove in the future due to security purposes
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_data": data.get("user_data"),
            }
        )

        # Set the access token cookie
        res.set_cookie(
            key=settings.SIMPLE_JWT["ACCESS_COOKIE"],
            value=access_token,
            domain=settings.SIMPLE_JWT["COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["ACCESS_COOKIE_PATH"],
            expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["COOKIE_SAMESITE"],
        )

        # Set the refresh token cookie
        res.set_cookie(
            key=settings.SIMPLE_JWT["REFRESH_COOKIE"],
            value=refresh_token,
            domain=settings.SIMPLE_JWT["COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["REFRESH_COOKIE_PATH"],
            expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["COOKIE_SAMESITE"],
        )

        return res


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, _):
        # Clear the cookies
        res = JsonResponse(
            {
                "success": True,
                "message": "Logged out successfully",
            }
        )

        # Blacklist the refresh token
        try:
            refresh_token = self.request.COOKIES.get(
                settings.SIMPLE_JWT["REFRESH_COOKIE"]
            )
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except KeyError:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Refresh token not found in cookies",
                },
                status=400,
            )
        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"An error occurred while blacklisting the token: {str(e)}",
                },
                status=500,
            )

        # Delete the cookies
        res.delete_cookie(settings.SIMPLE_JWT["ACCESS_COOKIE"])
        res.delete_cookie(settings.SIMPLE_JWT["REFRESH_COOKIE"])

        return res


class AuthCheckView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, _):
        return JsonResponse({"is_authenticated": True})
