from django.utils import timezone
from django.db import models


class SoftDeleteManager(models.Manager):
    """Manager that excludes soft-deleted objects by default"""

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(
                deleted_at__isnull=True,
            )
        )


class SoftDeleteMixin(models.Model):
    """Mixin to add soft delete functionality to models"""

    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        default=None,
    )

    # Default manager (excludes soft-deleted objects)
    objects = SoftDeleteManager()

    # Manager that includes all objects (including soft-deleted)
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at"])

    def is_deleted(self):
        return self.deleted_at is not None
