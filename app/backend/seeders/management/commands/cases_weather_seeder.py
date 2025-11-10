import random
import os
import json
from django.core.management.base import BaseCommand
from faker import Faker
from datetime import datetime, timedelta
from case.models import (
    Case,
    Patient,
)
from user.models import User
from weather.models import Weather


class Command(BaseCommand):
    help = "Seed random initial patient case data"

    def __init__(self):
        super().__init__()
        self.start_year = 2011
        self.end_year = 2023
        self.fake = Faker()

    def handle(self, *args, **kwargs):
        base_dir = os.path.dirname(os.path.abspath(__file__))

        for year in range(self.start_year, self.end_year + 1):
            json_file_path = os.path.join(base_dir, "json", f"{year}.json")

            try:
                print(f"Trying to seed data from {year}")
                self.seed_data(json_file_path)
                self.stdout.write(
                    self.style.SUCCESS(f"Data for year {year} seeded successfully.")
                )
            except FileNotFoundError:
                self.stdout.write(
                    self.style.WARNING(
                        f"JSON file for year {year} not found. Skipping this year."
                    )
                )
            except json.JSONDecodeError:
                self.stdout.write(
                    self.style.ERROR(
                        f"Error decoding JSON file for year {year}. Skipping this year."
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                "Successfully seeded the database with fake patient cases."
            )
        )

    def generate_fake_info(
        self,
        year,
        week,
        barangay_name,
        is_alive=True,
    ):

        first_day_of_year = datetime(year, 1, 1)
        last_day_of_year = datetime(year, 12, 31)

        monday_of_week = datetime.fromisocalendar(year, week, 1)
        sunday_of_week = monday_of_week + timedelta(days=6)

        start_day_inclusive = max(first_day_of_year, monday_of_week)
        end_day_inclusive = min(last_day_of_year, sunday_of_week)

        num_days_in_range = (end_day_inclusive - start_day_inclusive).days + 1
        random_day_offset = random.randrange(num_days_in_range)

        interviewer_ids = [12, 14, 16]
        interviewer = User.objects.get(id=random.choice(interviewer_ids))

        patient = Patient.objects.create(
            first_name=self.fake.first_name(),
            last_name=self.fake.last_name(),
            middle_name=self.fake.first_name(),
            date_of_birth=self.fake.date_of_birth(minimum_age=1, maximum_age=100),
            sex=random.choice(["M", "F"]),
            addr_house_no=self.fake.building_number(),
            addr_street=self.fake.street_name(),
            addr_barangay=barangay_name,
            addr_city="ILOILO CITY (Capital)",
            addr_province="Iloilo",
            addr_region="Region VI (Western Visayas)",
            civil_status=random.choice(["S", "M", "W", "SEP"]),
            date_first_vax=self.fake.date_this_decade(),
            date_last_vax=self.fake.date_this_decade(),
        )

        date_con = start_day_inclusive + timedelta(days=random_day_offset)
        date_onset = date_con - timedelta(days=random.randint(1, 20))
        ns1_result = random.choice(["P", "N", "E", "PR"])
        date_ns1 = (
            None
            if ns1_result == "PR"
            else date_onset + timedelta(days=random.randint(1, 5))
        )
        igg_elisa = random.choice(["P", "E", "PR"])
        date_igg_elisa = (
            None
            if igg_elisa == "PR"
            else date_onset + timedelta(days=random.randint(1, 10))
        )
        igm_elisa = random.choice(["P", "N", "E", "PR"])
        date_igm_elisa = (
            None
            if igm_elisa == "PR"
            else date_onset + timedelta(days=random.randint(1, 10))
        )
        pcr = random.choice(["P", "N", "E", "PR"])
        date_pcr = (
            None if pcr == "PR" else date_onset + timedelta(days=random.randint(1, 10))
        )
        outcome = "A" if is_alive else "D"
        date_death = (
            None
            if outcome == "A"
            else date_onset + timedelta(days=random.randint(5, 15))
        )

        Case.objects.create(
            date_con=date_con,
            is_admt=random.choice([True, False]),
            date_onset=date_onset,
            clncl_class=random.choice(["W", "S"]),
            ns1_result=ns1_result,
            date_ns1=date_ns1,
            igg_elisa=igg_elisa,
            date_igg_elisa=date_igg_elisa,
            igm_elisa=igm_elisa,
            date_igm_elisa=date_igm_elisa,
            pcr=pcr,
            date_pcr=date_pcr,
            case_class="C",
            outcome=outcome,
            date_death=date_death,
            interviewer=interviewer,
            patient=patient,
        )

    def seed_weather_data(
        self,
        year,
        week,
        max_temp,
        humidity,
        rainfall,
    ):
        monday_of_week = datetime.fromisocalendar(year, week, 1)
        weather = Weather(
            start_day=monday_of_week,
            location="ILOILO CITY (Capital)",
            weekly_rainfall=float(rainfall),
            weekly_temperature=float(max_temp),
            weekly_humidity=float(humidity),
        )
        weather.save()

    def seed_data(self, file_path):
        with open(
            file_path,
            "r",
            encoding="utf-8",
        ) as json_file:
            data = json.load(json_file)

            for week_ctr in data:
                year, week = week_ctr["week"].split("-w")
                year, week = int(year), int(week)

                # tmp_alive = 0
                # tmp_deaths = 0

                # if len(week_ctr["alive_cases"]) > 0:
                #     for entry in week_ctr["alive_cases"]:
                #         barangay_name = entry["barangay"]
                #         num_cases = entry["cases"]
                #         for _ in range(num_cases):
                #             tmp_alive += 1
                #             self.generate_fake_info(
                #                 year,
                #                 week,
                #                 barangay_name,
                #             )
                # if len(week_ctr["death_cases"]) > 0:
                #     for entry in week_ctr["death_cases"]:
                #         barangay_name = entry["barangay"]
                #         num_cases = entry["cases"]
                #         for _ in range(num_cases):
                #             tmp_deaths += 1
                #             self.generate_fake_info(
                #                 year,
                #                 week,
                #                 barangay_name,
                #                 is_alive=False,
                #             )

                case_types = [
                    ("alive_cases", True),
                    ("death_cases", False),
                ]

                for case_key, is_alive_status in case_types:
                    # Check if the key exists and the list is not empty
                    if case_key in week_ctr and week_ctr[case_key]:
                        for entry in week_ctr[case_key]:
                            barangay_name = entry["barangay"]
                            num_cases = entry["cases"]
                            for _ in range(num_cases):
                                self.generate_fake_info(
                                    year,
                                    week,
                                    barangay_name,
                                    is_alive=is_alive_status,
                                )

                # Seed weather data
                if "weather" in week_ctr:
                    wd = week_ctr["weather"]
                    max_temp = wd["max_temperature"]
                    humidity = wd["humidity"]
                    rainfall = wd["rainfall"]
                    self.seed_weather_data(
                        year,
                        week,
                        max_temp,
                        humidity,
                        rainfall,
                    )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully seeded weather data for year {year}."
                ),
            )
