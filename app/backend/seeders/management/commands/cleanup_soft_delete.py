from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from user.models import User
from case.models import Case, Patient


class Command(BaseCommand):
    help = "Permanently delete soft-deleted records older than specified days"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Delete soft-deleted records older than this many days (default: 30)",
        )

    def handle(self, *args, **options):
        days = options["days"]
        cutoff_date = timezone.now() - timedelta(days=days)

        # Hard delete soft-deleted records older than cutoff_date
        with transaction.atomic():
            users_deleted = User.all_objects.filter(
                deleted_at__lt=cutoff_date, deleted_at__isnull=False
            ).delete()

            cases_deleted = Case.all_objects.filter(
                deleted_at__lt=cutoff_date, deleted_at__isnull=False
            ).delete()

            patients_deleted = Patient.all_objects.filter(
                deleted_at__lt=cutoff_date, deleted_at__isnull=False
            ).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully deleted {users_deleted[0]} users, "
                f"{cases_deleted[0]} cases, and {patients_deleted[0]} patients "
                f"that were soft-deleted more than {days} days ago."
            )
        )
