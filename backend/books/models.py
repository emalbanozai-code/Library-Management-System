from django.db import models

from core.base_models import BaseModel


class BookCategory(BaseModel):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'book_categories'

    def __str__(self):
        return self.name


class Book(BaseModel):
    title = models.CharField(max_length=255, db_index=True)
    author = models.CharField(max_length=255, db_index=True)
    isbn = models.CharField(max_length=32, unique=True, db_index=True)
    category = models.ForeignKey(BookCategory, on_delete=models.PROTECT, related_name='books')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rentable = models.BooleanField(default=True)
    quantity = models.PositiveIntegerField(default=0)
    publisher = models.CharField(max_length=255, blank=True, db_index=True)
    publish_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'books'

    def __str__(self):
        return f"{self.title} ({self.isbn})"
