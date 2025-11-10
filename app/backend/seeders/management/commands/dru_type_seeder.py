from django.core.management.base import BaseCommand
from dru.models import DRUType


class Command(BaseCommand):
    help = "Seed DRU Types"

    def handle(self, *args, **kwargs):
        dru_types = [
            "National",
            "RESU",
            "PESU",
            "CESU",
            "RHU",
            "CHO/MHO/PHO",
            "Government Hospital",
            "Private Hospital",
            "Clinic",
            "Private Laboratory",
            "Public Laboratory",
            "Seaport/Airport",
        ]
        for dru_type in dru_types:
            DRUType.objects.get_or_create(dru_classification=dru_type)

        self.stdout.write(
            self.style.SUCCESS(
                "Successfully seeded DRU Types data",
            ),
        )
