from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from books.models import Book
from core.base_models import BaseModel
from customers.models import Customer


MONEY_QUANTIZE = Decimal('0.01')


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTIZE, rounding=ROUND_HALF_UP)


class Lending(BaseModel):
    STATUS_RETURNED = 'returned'
    STATUS_NOT_RETURNED = 'not_returned'
    STATUS_CHOICES = [
        (STATUS_RETURNED, 'Returned'),
        (STATUS_NOT_RETURNED, 'Not Returned'),
    ]

    PAYMENT_STATUS_PAID = 'paid'
    PAYMENT_STATUS_UNPAID = 'unpaid'
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_PAID, 'Paid'),
        (PAYMENT_STATUS_UNPAID, 'Unpaid'),
    ]

    PAYMENT_METHOD_CASH = 'cash'
    PAYMENT_METHOD_CARD = 'card'
    PAYMENT_METHOD_TRANSFER = 'transfer'
    PAYMENT_METHOD_ONLINE = 'online'
    PAYMENT_METHOD_OTHER = 'other'
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_METHOD_CASH, 'Cash'),
        (PAYMENT_METHOD_CARD, 'Card'),
        (PAYMENT_METHOD_TRANSFER, 'Bank Transfer'),
        (PAYMENT_METHOD_ONLINE, 'Online'),
        (PAYMENT_METHOD_OTHER, 'Other'),
    ]

    book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name='lendings')
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='lendings')
    start_date = models.DateField(default=timezone.localdate, db_index=True)
    end_date = models.DateField(db_index=True)
    rent_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NOT_RETURNED,
        db_index=True,
    )
    fine_per_day = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    late_days = models.PositiveIntegerField(default=0)
    fine_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_STATUS_UNPAID,
        db_index=True,
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default=PAYMENT_METHOD_CASH,
        db_index=True,
    )
    returned_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = 'lendings'

    def __str__(self):
        return f"Lending #{self.id or 'new'} - {self.book.title}"

    def clean(self):
        super().clean()
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({'end_date': 'End date cannot be earlier than start date.'})
        if self.rent_price < 0:
            raise ValidationError({'rent_price': 'Rent price cannot be negative.'})
        if self.fine_per_day < 0:
            raise ValidationError({'fine_per_day': 'Fine per day cannot be negative.'})
        if self.late_days < 0:
            raise ValidationError({'late_days': 'Late days cannot be negative.'})
        if self.fine_amount < 0:
            raise ValidationError({'fine_amount': 'Fine amount cannot be negative.'})

    def recalculate_fine(self, reference_date=None):
        effective_date = reference_date or timezone.localdate()
        self.late_days = max((effective_date - self.end_date).days, 0)
        self.fine_amount = quantize_money(Decimal(self.fine_per_day or Decimal('0.00')) * self.late_days)
