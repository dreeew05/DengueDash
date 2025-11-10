import csv
from django.core.management.base import BaseCommand
from weather.models import Weather
from datetime import datetime, timedelta
import os


class Command(BaseCommand):
    help = "Seeds weather data from a CSV file into the database"

    def handle(self, *args, **kwargs):
        # Define your CSV file path (make sure it's correct)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_file_path = os.path.join(base_dir, "csv", "weather_dataset.csv")

        # Open the CSV file
        with open(csv_file_path, mode="r") as file:
            reader = csv.DictReader(file)

            # Iterate over each row in the CSV
            for row in reader:
                # Extract year and week number from the 'Time' column (e.g., '2011-w1')
                year, week = row["Time"].split("-w")
                year, week = int(year), int(week)

                # Calculate the first day of the week (Monday) based on the year and week
                # First, create a date object for the first day of the year
                first_day_of_year = datetime(year, 1, 1)

                # Now find the date for the first day of the specified week
                start_day = first_day_of_year + timedelta(weeks=week - 1)

                # Ensure it is a Monday (if the first day of the year isn't a Monday, adjust)
                start_day -= timedelta(days=start_day.weekday())

                # Create the Weather record
                weather = Weather(
                    start_day=start_day.date(),
                    location="ILOILO CITY (Capital)",
                    weekly_rainfall=float(row["Rainfall"]),
                    weekly_temperature=float(row["MaxTemperature"]),
                    weekly_humidity=float(row["Humidity"]),
                )
                weather.save()

        self.stdout.write(self.style.SUCCESS("Successfully seeded weather data."))
