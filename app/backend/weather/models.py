from django.db import models


class Weather(models.Model):
    weather_id = models.AutoField(
        primary_key=True,
        blank=False,
        null=False,
    )
    start_day = models.DateField(
        blank=False,
        null=False,
    )
    location = models.CharField(
        max_length=100,
        blank=False,
        null=False,
    )
    weekly_rainfall = models.FloatField(
        blank=False,
        null=False,
    )
    weekly_temperature = models.FloatField(
        blank=False,
        null=False,
    )
    weekly_humidity = models.FloatField(
        blank=False,
        null=False,
    )

    def __str__(self):
        return f"{self.weather_id}"
