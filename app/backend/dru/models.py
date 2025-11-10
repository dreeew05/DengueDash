from django.db import models
from core.models import BaseModel
from auth.models import SoftDeleteMixin


class DRUType(models.Model):

    dru_classification = models.CharField(
        max_length=20,
    )

    def __str__(self):
        return self.dru_classification


class DRU(
    BaseModel,
    SoftDeleteMixin,
):

    region = models.CharField(
        max_length=50,
        blank=False,
        null=True,
    )
    surveillance_unit = models.CharField(
        max_length=50,
        blank=False,
        null=True,
    )
    dru_name = models.CharField(
        max_length=100,
        blank=False,
        null=False,
    )
    addr_street = models.CharField(
        max_length=100,
        blank=False,
        null=False,
    )
    addr_barangay = models.CharField(
        max_length=100,
        blank=False,
        null=False,
    )
    addr_city = models.CharField(
        max_length=100,
        blank=False,
        null=False,
    )
    addr_province = models.CharField(
        max_length=100,
        blank=False,
        null=False,
    )
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
    )
    contact_number = models.CharField(
        unique=True,
        max_length=20,
        blank=False,
        null=False,
    )

    dru_type = models.ForeignKey(
        DRUType,
        on_delete=models.CASCADE,
        blank=False,
        null=False,
        related_name="dru_type",
    )

    def __str__(self):
        return self.dru_name
