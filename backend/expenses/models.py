from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from core.base_models import BaseModel
from employees.models import Employee


class Expense(BaseModel):
    CATEGORY_SALARY = 'salary'
    CATEGORY_ELECTRICITY = 'electricity'
    CATEGORY_RENT = 'rent'
    CATEGORY_WATER = 'water'
    CATEGORY_INTERNET = 'internet'
    CATEGORY_MAINTENANCE = 'maintenance'
    CATEGORY_SUPPLIES = 'supplies'
    CATEGORY_OTHER = 'other'

    CATEGORY_CHOICES = [
        (CATEGORY_SALARY, 'Salary'),
        (CATEGORY_ELECTRICITY, 'Electricity'),
        (CATEGORY_RENT, 'Rent'),
        (CATEGORY_WATER, 'Water'),
        (CATEGORY_INTERNET, 'Internet'),
        (CATEGORY_MAINTENANCE, 'Maintenance'),
        (CATEGORY_SUPPLIES, 'Supplies'),
        (CATEGORY_OTHER, 'Other'),
    ]

    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(default=timezone.localdate, db_index=True)
    paid_by = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name='expenses')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, db_index=True)

    class Meta:
        db_table = 'expenses'

    def __str__(self):
        return f"{self.title} ({self.amount})"

    def clean(self):
        super().clean()
        if self.amount is None or self.amount <= 0:
            raise ValidationError({'amount': 'Amount must be greater than zero.'})
        if self.payment_date and self.payment_date > timezone.localdate():
            raise ValidationError({'payment_date': 'Payment date cannot be in the future.'})
