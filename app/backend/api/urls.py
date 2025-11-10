from django.urls import path, include

urlpatterns = [
    path("auth/", include("auth.urls")),
    path("user/", include("user.urls")),
    path("cases/", include("case.urls")),
    path("dru/", include("dru.urls")),
    path("weather/", include("weather.urls")),
    path("forecasting/", include("forecasting.urls")),
]
