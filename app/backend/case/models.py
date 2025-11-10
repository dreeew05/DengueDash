from django.db import models
from datetime import datetime
from user.models import User
from auth.models import SoftDeleteMixin
from core.models import BaseModel


class Patient(SoftDeleteMixin):
    last_name = models.CharField(
        max_length=50,
        blank=False,
        null=False,
    )
    first_name = models.CharField(
        max_length=100,
        blank=False,
        null=False,
    )
    middle_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    suffix = models.CharField(
        max_length=5,
        blank=True,
        null=True,
    )
    date_of_birth = models.DateField(
        blank=False,
        null=False,
    )

    sex_choices = [("M", "Male"), ("F", "Female")]
    sex = models.CharField(
        max_length=1,
        choices=sex_choices,
        blank=False,
        null=False,
    )

    addr_house_no = models.IntegerField(
        blank=True,
        null=True,
    )
    addr_street = models.CharField(
        max_length=100,
        blank=True,
        null=True,
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
    addr_region = models.CharField(
        max_length=50,
        blank=False,
        null=False,
    )

    civil_status_choices = [
        ("S", "Single"),
        ("M", "Married"),
        ("W", "Widowed"),
        ("SEP", "Separated"),
    ]
    civil_status = models.CharField(
        max_length=3,
        choices=civil_status_choices,
        blank=False,
        null=False,
    )

    date_first_vax = models.DateField(
        blank=False,
        null=True,
    )
    date_last_vax = models.DateField(
        blank=False,
        null=True,
    )

    def __str__(self):
        return f"{self.first_name} {self.middle_name} {self.last_name}".strip()


class Case(BaseModel, SoftDeleteMixin):
    case_id = models.BigIntegerField(
        primary_key=True,
        editable=False,
    )
    date_con = models.DateField(
        blank=False,
        null=False,
    )
    is_admt = models.BooleanField(
        blank=False,
        null=False,
    )
    date_onset = models.DateField(
        blank=False,
        null=False,
    )

    clinical_class_choices = [
        ("N", "No warning signs"),
        ("W", "With warning signs"),
        ("S", "Severe dengue"),
    ]
    clncl_class = models.CharField(
        max_length=100,
        choices=clinical_class_choices,
        blank=False,
        null=False,
    )

    lab_result_choices = [
        ("P", "Positive"),
        ("N", "Negative"),
        ("E", "Equivocal"),
        ("PR", "Pending Result"),
    ]

    ns1_result = models.CharField(
        max_length=100,
        choices=lab_result_choices,
        blank=False,
        null=False,
    )
    date_ns1 = models.DateField(
        blank=False,
        null=True,
        default=None,
    )
    igg_elisa = models.CharField(
        max_length=2,
        choices=lab_result_choices,
        blank=False,
        null=False,
    )
    date_igg_elisa = models.DateField(
        blank=False,
        null=True,
        default=None,
    )
    igm_elisa = models.CharField(
        max_length=2,
        choices=lab_result_choices,
        blank=False,
        null=False,
    )
    date_igm_elisa = models.DateField(
        blank=False,
        null=True,
        default=None,
    )
    pcr = models.CharField(
        max_length=2,
        choices=lab_result_choices,
        blank=False,
        null=False,
    )
    date_pcr = models.DateField(
        blank=False,
        null=True,
        default=None,
    )

    case_class_choices = [
        ("S", "Suspected"),
        ("P", "Probable"),
        ("C", "Confirmed"),
    ]
    case_class = models.CharField(
        max_length=1,
        choices=case_class_choices,
        blank=False,
        null=False,
    )

    outcome_choices = [("A", "Alive"), ("D", "Dead")]
    outcome = models.CharField(
        max_length=1,
        choices=outcome_choices,
        blank=False,
        null=False,
    )
    date_death = models.DateField(
        blank=False,
        null=True,
        default=None,
    )

    interviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="user",
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        blank=False,
        null=False,
        related_name="patient",
    )

    def save(self, *args, **kwargs):
        if not self.pk:
            current_year = datetime.now().year % 100
            prefix = current_year * 1000000

            if last_record := (
                Case.all_objects.filter(case_id__startswith=str(current_year))
                .order_by("case_id")
                .last()
            ):
                last_case_id = last_record.case_id
                self.case_id = last_case_id + 1
            else:
                self.case_id = prefix

        super(Case, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.case_id)
