from django.conf import settings
from django.db import models

from core.base_models import BaseModel
from core.utils import upload_image_path


def employee_picture_upload_path(instance, filename):
    return upload_image_path(
        instance=instance,
        filename=filename,
        folder_name='employees',
        instance_field_name='id'
    )


class Employee(BaseModel):
    MEMBERSHIP_PERMANENT = 'permanent'
    MEMBERSHIP_CONTRACT = 'contract'
    MEMBERSHIP_INTERN = 'intern'
    MEMBERSHIP_CHOICES = [
        (MEMBERSHIP_PERMANENT, 'Permanent'),
        (MEMBERSHIP_CONTRACT, 'Contract'),
        (MEMBERSHIP_INTERN, 'Intern'),
    ]

    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_INACTIVE, 'Inactive'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='employee_profile',
    )
    father_name = models.CharField(max_length=150)
    date_of_birth = models.DateField()
    address = models.TextField()
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    work_days = models.TextField(default='[]')
    join_date = models.DateField()
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE, db_index=True)
    picture = models.ImageField(
        upload_to=employee_picture_upload_path,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = 'employees'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['membership_type']),
            models.Index(fields=['join_date']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.user.username})"
