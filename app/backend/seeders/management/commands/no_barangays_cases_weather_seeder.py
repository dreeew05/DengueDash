import random
import os
import csv
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
        self.fake = Faker()
        self.barangays = [
            "Santa Cruz",
            "Aguinaldo",
            "Airport (Tabucan Airport)",
            "Alalasan Lapuz",
            "Arguelles",
            "Arsenal Aduana",
            "North Avanceña",
            "Bakhaw",
            "Balabago",
            "Balantang",
            "Baldoza",
            "Sinikway (Bangkerohan Lapuz)",
            "Bantud",
            "Banuyao",
            "Baybay Tanza",
            "Benedicto (Jaro)",
            "Bito-on",
            "Monica Blumentritt",
            "Bolilao",
            "Bonifacio Tanza",
            "Bonifacio (Arevalo)",
            "Buhang",
            "Buhang Taft North",
            "Buntatala",
            "Seminario (Burgos Jalandoni)",
            "Caingin",
            "Calahunan",
            "Calaparan",
            "Calumpang",
            "Camalig",
            "El 98 Castilla (Claudio Lopez)",
            "Cochero",
            "Compania",
            "Concepcion-Montes",
            "Cuartero",
            "Cubay",
            "Danao",
            "Mabolo-delgado",
            "Democracia",
            "Desamparados",
            "Divinagracia",
            "Don Esteban-Lapuz",
            "Dulonan",
            "Dungon",
            "Dungon A",
            "Dungon B",
            "East Baluarte",
            "East Timawa",
            "Edganzon",
            "Tanza-Esperanza",
            "Fajardo",
            "Flores",
            "South Fundidor",
            "General Hughes-Montes",
            "Gloria",
            "Gustilo",
            "Guzman-Jesena",
            "Habog-habog Salvacion",
            "Hibao-an Sur",
            "Hinactacan",
            "Hipodromo",
            "Inday",
            "Infante",
            "Ingore",
            "Jalandoni Estate-Lapuz",
            "Jalandoni-Wilson",
            "Delgado-Jalandoni-Bagumbayan",
            "Javellana",
            "Jereos",
            "Calubihan",
            "Kasingkasing",
            "Katilingban",
            "Kauswagan",
            "Our Lady of Fatima",
            "Laguda",
            "Lanit",
            "Lapuz Norte",
            "Lapuz Sur",
            "Legaspi dela Rama",
            "Liberation",
            "Libertad, Santa Isabel",
            "Libertad-Lapuz",
            "Lopez Jaena (Jaro)",
            "Loboc-Lapuz",
            "Lopez Jaena Norte",
            "Lopez Jaena Sur",
            "Luna (Jaro)",
            "M. V. Hechanova",
            "Burgos-Mabini-Plaza",
            "Macarthur",
            "Magdalo",
            "Magsaysay",
            "Magsaysay Village",
            "Malipayon-delgado",
            "Mansaya-Lapuz",
            "Marcelo H. del Pilar",
            "Maria Clara",
            "Maria Cristina",
            "Mohon",
            "Molo Boulevard",
            "Montinola",
            "Muelle Loney-Montes",
            "Nabitasan",
            "Navais",
            "Nonoy",
            "North Fundidor",
            "North Baluarte",
            "North San Jose",
            "Oñate de Leon",
            "Obrero-Lapuz",
            "Ortiz",
            "Osmeña",
            "Our Lady of Lourdes",
            "Rizal Palapala I",
            "Rizal Palapala II",
            "PHHC Block 17",
            "PHHC Block 22 NHA",
            "Poblacion Molo",
            "President Roxas",
            "Progreso-Lapuz",
            "Punong-Lapuz",
            "Quezon",
            "Quintin Salas",
            "Rima-Rizal",
            "Rizal Estanzuela",
            "Rizal Ibarra",
            "Railway",
            "Roxas Village",
            "Sambag",
            "Sampaguita",
            "San Agustin",
            "San Antonio",
            "San Felix",
            "San Isidro (Jaro)",
            "Hibao-an Norte",
            "San Jose (Jaro)",
            "San Jose (Arevalo)",
            "San Juan",
            "San Nicolas",
            "San Pedro (Molo)",
            "San Pedro (Jaro)",
            "San Rafael",
            "San Roque",
            "San Vicente",
            "Santa Filomena",
            "Santa Rosa",
            "Santo Domingo",
            "Santo Niño Norte",
            "Santo Niño Sur",
            "Santo Rosario-Duran",
            "Simon Ledesma",
            "So-oc",
            "South Baluarte",
            "South San Jose",
            "Taal",
            "Tabuc Suba (Jaro)",
            "Tabucan",
            "Tacas",
            "Abeto Mirasol Taft South (Quirino Abeto)",
            "Tagbac",
            "Tap-oc",
            "Taytay Zone II",
            "Ticud (La Paz)",
            "Timawa Tanza I",
            "Timawa Tanza II",
            "Ungka",
            "Veterans Village",
            "Villa Anita",
            "West Habog-habog",
            "West Timawa",
            "Yulo-Arroyo",
            "Yulo Drive",
            "Zamora-Melliza",
            "Pale Benedicto Rizal (Mandurriao)",
            "Kahirupan",
            "Luna (La Paz)",
            "San Isidro (La Paz)",
            "San Jose (City Proper)",
            "Tabuc Suba (La Paz)",
            "Rizal (La Paz)",
        ]

    def handle(self, *args, **kwargs):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_file_path = os.path.join(base_dir, "csv", "no_barangays_data.csv")

        with open(csv_file_path, mode="r") as file:
            reader = csv.DictReader(file)

            for row in reader:
                year, week = row["Time"].split("-w")
                year, week = int(year), int(week)

                alive_cases = int(row["Alive"])
                death_cases = int(row["Deaths"])
                max_temp = float(row["MaxTemperature"])
                humidity = float(row["Humidity"])
                rainfall = float(row["Rainfall"])

                self.seed_data(
                    year,
                    week,
                    alive_cases,
                )
                self.seed_data(
                    year,
                    week,
                    death_cases,
                    is_alive=False,
                )
                self.seed_weather_data(
                    year,
                    week,
                    max_temp,
                    humidity,
                    rainfall,
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded the database with fake patient cases and weather data."
            )
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

    def seed_data(
        self,
        year,
        week,
        num_cases,
        is_alive=True,
    ):
        for _ in range(num_cases):
            first_day_of_year = datetime(year, 1, 1)
            last_day_of_year = datetime(year, 12, 31)

            monday_of_week = datetime.fromisocalendar(year, week, 1)
            sunday_of_week = monday_of_week + timedelta(days=6)

            start_day_inclusive = max(first_day_of_year, monday_of_week)
            end_day_inclusive = min(last_day_of_year, sunday_of_week)

            num_days_in_range = (end_day_inclusive - start_day_inclusive).days + 1
            random_day_offset = random.randrange(num_days_in_range)

            first_name = self.fake.first_name()
            last_name = self.fake.last_name()
            middle_name = self.fake.first_name()
            date_of_birth = self.fake.date_of_birth(minimum_age=1, maximum_age=100)
            sex = random.choice(["M", "F"])
            addr_barangay = random.choice(self.barangays)
            interviewer_ids = [12, 14, 16]
            interviewer = User.objects.get(id=random.choice(interviewer_ids))

            patient = Patient.objects.create(
                first_name=first_name,
                last_name=last_name,
                middle_name=middle_name,
                date_of_birth=date_of_birth,
                sex=sex,
                addr_house_no=self.fake.building_number(),
                addr_street=self.fake.street_name(),
                addr_barangay=addr_barangay,
                addr_city="ILOILO CITY (Capital)",
                addr_province="Iloilo",
                addr_region="Region VI (Western Visayas)",
                civil_status=random.choice(["S", "M", "W", "SEP"]),
                date_first_vax=self.fake.date_this_decade(),
                date_last_vax=self.fake.date_this_decade(),
            )

            date_con = start_day_inclusive + timedelta(days=random_day_offset)
            is_admt = random.choice([True, False])
            date_onset = date_con - timedelta(days=random.randint(1, 20))
            clncl_class = random.choice(["W", "S"])
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
                None
                if pcr == "PR"
                else date_onset + timedelta(days=random.randint(1, 10))
            )
            # case_class = random.choice(["S", "P", "C"])
            case_class = "C"
            outcome = "A" if is_alive else "D"
            date_death = (
                None
                if outcome == "A"
                else date_onset + timedelta(days=random.randint(5, 15))
            )

            Case.objects.create(
                date_con=date_con,
                is_admt=is_admt,
                date_onset=date_onset,
                clncl_class=clncl_class,
                ns1_result=ns1_result,
                date_ns1=date_ns1,
                igg_elisa=igg_elisa,
                date_igg_elisa=date_igg_elisa,
                igm_elisa=igm_elisa,
                date_igm_elisa=date_igm_elisa,
                pcr=pcr,
                date_pcr=date_pcr,
                case_class=case_class,
                outcome=outcome,
                date_death=date_death,
                interviewer=interviewer,
                patient=patient,
            )
