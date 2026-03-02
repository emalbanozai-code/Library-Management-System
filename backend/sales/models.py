from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from books.models import Book
from core.base_models import BaseModel


class Customer(BaseModel):
    full_name = models.CharField(max_length=255, db_index=True)
    phone = models.CharField(max_length=32, blank=True, db_index=True)
    email = models.EmailField(blank=True, db_index=True)
    is_active = models.BooleanField(default=True)
    total_completed_sales = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_purchase_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'customers'

    def __str__(self):
        return self.full_name


class Sale(BaseModel):
    STATUS_DRAFT = 'draft'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    sale_date = models.DateTimeField(default=timezone.now, db_index=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        related_name='sales',
        null=True,
        blank=True,
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, db_index=True)
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True, db_index=True)
    cancelled_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = 'sales'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['sale_date']),
            models.Index(fields=['customer']),
        ]

    def __str__(self):
        return f"Sale #{self.id or 'new'} - {self.status}"

    @property
    def is_editable(self):
        return self.status == self.STATUS_DRAFT


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name='sale_items')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    book_title_snapshot = models.CharField(max_length=255)
    book_isbn_snapshot = models.CharField(max_length=32)

    class Meta:
        db_table = 'sale_items'
        constraints = [
            models.UniqueConstraint(fields=['sale', 'book'], name='unique_sale_book_item'),
        ]
        indexes = [
            models.Index(fields=['sale']),
            models.Index(fields=['book']),
        ]

    def __str__(self):
        return f"{self.book_title_snapshot} x {self.quantity}"

    def clean(self):
        super().clean()
        if self.quantity <= 0:
            raise ValidationError({'quantity': 'Quantity must be greater than zero.'})
        if self.unit_price < 0:
            raise ValidationError({'unit_price': 'Unit price cannot be negative.'})

