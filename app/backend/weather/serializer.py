from rest_framework import serializers
from weather.models import Weather


class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = [
            "weather_id",
            "start_day",
            "weekly_rainfall",
            "weekly_temperature",
            "weekly_humidity",
        ]
