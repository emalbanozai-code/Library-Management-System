from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from core.base_models import BaseModel


class Customer(BaseModel):
    GENDER_MALE = 'male'
    GENDER_FEMALE = 'female'
    GENDER_OTHER = 'other'

    GENDER_CHOICES = [
        (GENDER_MALE, 'Male'),
        (GENDER_FEMALE, 'Female'),
        (GENDER_OTHER, 'Other'),
    ]

    first_name = models.CharField(max_length=150, db_index=True)
    last_name = models.CharField(max_length=150, db_index=True)
    photo = models.ImageField(upload_to='customers/photos/', blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, db_index=True)
    email = models.EmailField(blank=True, db_index=True)
    address = models.TextField(blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default=GENDER_OTHER, db_index=True)
    total_purchases = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'customer_profiles'
        indexes = [
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['total_purchases']),
        ]

    def __str__(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

