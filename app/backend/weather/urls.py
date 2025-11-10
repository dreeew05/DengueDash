from django.urls import path
from .views import WeatherView

urlpatterns = [
    path("get/", WeatherView.as_view(), name="weather"),
]
