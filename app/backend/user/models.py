from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from core.models import BaseModel
from dru.models import DRU
from auth.models import SoftDeleteMixin
import os
import uuid


def user_image_path(_, image_type, filename):
    """Generate file path for user images"""
    ext = filename.split(".")[-1]
    # Generate a unique filename using UUID
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join(f"images/{image_type}/", unique_filename)


def profile_image_upload_path(instance, filename):
    return user_image_path(instance, "profile", filename)


def id_card_image_upload_path(instance, filename):
    return user_image_path(instance, "id_card", filename)


class BlacklistedUsers(models.Model):
    email = models.EmailField(
        max_length=255,
        unique=True,
        blank=False,
        null=False,
    )
    dru = models.ForeignKey(
        DRU,
        on_delete=models.CASCADE,
        blank=False,
        null=False,
        related_name="blacklisted_users",
    )
    date_added = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.email


class UserManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def create_user(
        self,
        email,
        password=None,
        **extra_fields,
    ):
        user = self.model(
            email=self.normalize_email(email),
            **extra_fields,
        )
        user.set_password(password)
        extra_fields.setdefault("is_superuser", False)
        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        email,
        password,
        **extra_fields,
    ):
        extra_fields.setdefault(
            "is_admin",
            True,
        )
        extra_fields.setdefault(
            "is_superuser",
            True,
        )
        extra_fields.setdefault(
            "is_verified",
            True,
        )
        extra_fields.setdefault(
            "is_legacy",
            True,
        )
        if "dru" not in extra_fields:
            try:
                extra_fields["dru"] = DRU.objects.get(id=1)
            except DRU.DoesNotExist:
                raise ValueError(
                    "create_superuser requires a DRU instance; "
                    "Please run the seeders to create a default DRU."
                )

        return self.create_user(
            email,
            password,
            **extra_fields,
        )


class User(
    AbstractBaseUser,
    PermissionsMixin,
    BaseModel,
    SoftDeleteMixin,
):
    email = models.EmailField(
        max_length=255,
        unique=True,
        blank=False,
        null=False,
    )
    last_name = models.CharField(
        max_length=50,
        blank=True,
        null=False,
    )
    first_name = models.CharField(
        max_length=100,
        blank=False,
        null=False,
    )
    middle_name = models.CharField(
        max_length=50,
        blank=True,
        null=False,
    )

    sex_choices = [
        ("M", "Male"),
        ("F", "Female"),
        ("N/A", "Not Applicable"),
    ]
    sex = models.CharField(
        max_length=3,
        choices=sex_choices,
        blank=False,
        null=False,
    )

    dru = models.ForeignKey(
        DRU,
        on_delete=models.SET_NULL,
        blank=False,
        null=True,
        related_name="user",
    )

    # todo: make the images required fields

    profile_image = models.ImageField(
        upload_to=profile_image_upload_path,
        blank=False,
        null=False,
        default="images/profile/default_profile.jpeg",
    )

    id_card_image = models.ImageField(
        upload_to=id_card_image_upload_path,
        blank=False,
        null=False,
        default="images/id_card/default_id_card.jpeg",
    )

    is_admin = models.BooleanField(default=False)
    is_legacy = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = [
        "first_name",
        "middle_name",
        "last_name",
        "sex",
    ]

    objects = UserManager()  # Default manager
    all_objects = models.Manager()  # For accessing all users, including soft-deleted

    def __str__(self):
        return self.email

    # todo: delete images in mediafiles after hard delete
