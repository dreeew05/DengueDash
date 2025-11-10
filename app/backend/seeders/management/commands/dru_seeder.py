import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from dru.models import DRU, DRUType
from faker import Faker

User = get_user_model()


class Command(BaseCommand):
    help = "Seed initial DRU data"

    def handle(self, *args, **kwargs):
        fake = Faker()
        drus = [
            {
                "name": "Philippine Integrated Disease Surveillance and Response",
                "addr_street": "San Lazaro Compound, Tayuman",
                "addr_barangay": "Santa Cruz",
                "addr_city": "Manila",
                "addr_province": "Metro Manila",
                "type": DRUType.objects.get(id=1),
                "unit": None,
                "region": None,
                "email": "pidsr@gmail.com",
                "contact_number": "09123456785",
            },
            {
                "name": "Western Visayas Regional Epedemiology and Surveillance Unit",
                "addr_street": "West Visayas State University",
                "addr_barangay": "Lapaz",
                "addr_city": "ILOILO CITY (Capital)",
                "addr_province": "ILOILO",
                "type": DRUType.objects.get(id=2),
                "unit": None,
                "region": "Region VI (Western Visayas)",
                "email": "iloiloresu@gmail.com",
                "contact_number": "09123456789",
            },
            {
                "name": "Iloilo Provincial Epedemiology and Surveillance Unit",
                "addr_street": "Provincial Capitol, Bonifacio Drive",
                "addr_barangay": "Lapaz",
                "addr_city": "ILOILO CITY (Capital)",
                "addr_province": "ILOILO",
                "type": DRUType.objects.get(id=3),
                "unit": "Iloilo PESU",
                "region": "Region VI (Western Visayas)",
                "email": "iloilopesu@gmail.com",
                "contact_number": "09123456780",
            },
            {
                "name": "Iloilo City Epedemiology and Surveillance Unit",
                "addr_street": "City Health Office, Bonifacio Drive",
                "addr_barangay": "Lapaz",
                "addr_city": "ILOILO CITY (Capital)",
                "addr_province": "ILOILO",
                "type": DRUType.objects.get(id=4),
                "unit": "Iloilo CESU",
                "region": "Region VI (Western Visayas)",
                "email": "iloilocesu@gmail.com",
                "contact_number": "09123456781",
            },
            {
                "name": "Miagao Municipal Health Office",
                "addr_street": "Hollywood Street",
                "addr_barangay": "Mat-y",
                "addr_city": "Miagao",
                "addr_province": "ILOILO",
                "type": DRUType.objects.get(id=5),
                "unit": "Iloilo PESU",
                "region": "Region VI (Western Visayas)",
                "email": "miagaohealth@gmail.com",
                "contact_number": "09123456786",
            },
            {
                "name": "Molo District Health Center",
                "addr_street": "M.H. Del Pilar Street, Molo",
                "addr_barangay": "Molo",
                "addr_city": "ILOILO CITY (Capital)",
                "addr_province": "ILOILO",
                "type": DRUType.objects.get(id=6),
                "unit": "Iloilo CESU",
                "region": "Region VI (Western Visayas)",
                "email": "molodistricthealth@gmail.com",
                "contact_number": "09123456782",
            },
            {
                "name": "Jaro 1 Health Center",
                "addr_street": "Jaro Plaza",
                "addr_barangay": "Jaro",
                "addr_city": "ILOILO CITY (Capital)",
                "addr_province": "ILOILO",
                "type": DRUType.objects.get(id=6),
                "unit": "Iloilo CESU",
                "region": "Region VI (Western Visayas)",
                "email": "jaro1health@gmail.com",
                "contact_number": "09123456783",
            },
            {
                "name": "Saint Paul's Hospital",
                "addr_street": "General Luna Street",
                "addr_barangay": "City Proper",
                "addr_city": "ILOILO CITY (Capital)",
                "addr_province": "ILOILO",
                "type": DRUType.objects.get(id=8),
                "unit": "Iloilo CESU",
                "region": "Region VI (Western Visayas)",
                "email": "saintpaul@gmail.com",
                "contact_number": "09123456784",
            },
        ]

        for dru in drus:
            DRU.objects.get_or_create(
                dru_name=dru["name"],
                addr_street=dru["addr_street"],
                addr_barangay=dru["addr_barangay"],
                addr_city=dru["addr_city"],
                addr_province=dru["addr_province"],
                dru_type=dru["type"],
                surveillance_unit=dru["unit"],
                region=dru["region"],
                email=dru["email"],
                contact_number=dru["contact_number"],
            )
            # Make one admin and one encoder
            User.objects.create_user(
                email=dru["email"],
                password="testpassword",
                first_name=dru["name"],
                middle_name="",
                last_name="",
                sex="N/A",
                is_admin=True,
                is_verified=True,
                is_legacy=True,
                profile_image="images/profile/default_profile.jpeg",
                id_card_image="images/id_card/default_id_card.jpeg",
                dru=DRU.objects.get(dru_name=dru["name"]),
            )
            User.objects.create_user(
                email=fake.email(),
                password="testpassword",
                first_name=fake.first_name(),
                middle_name=fake.last_name(),
                last_name=fake.last_name(),
                sex=random.choice(["M", "F"]),
                is_admin=False,
                is_verified=True,
                is_legacy=False,
                dru=DRU.objects.get(dru_name=dru["name"]),
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Successfully seeded DRU data",
            )
        )
