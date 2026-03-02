from django.core.exceptions import ValidationError
from django.db import models

from core.base_models import BaseModel


class Book(BaseModel): # دا همیشه دغه برخې بای ډیفالټ لري کریټ،اپډیټ،ډیلیټ او ریډ :BaseModel
    title = models.CharField(max_length=255, db_index=True)
    author = models.CharField(max_length=255, db_index=True)
    isbn = models.CharField(max_length=32, unique=True, db_index=True)
    category = models.CharField(max_length=100, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rentable = models.BooleanField(default=True)
    quantity = models.PositiveIntegerField(default=0)
    available_quantity = models.PositiveIntegerField(default=0)
    publisher = models.CharField(max_length=255, blank=True, db_index=True)
    publish_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'books' # ددغه څخه دا مطلب دی چی په ټیبل کی به یی همدا نوم وي 

        # unique_together = ['title', 'author'] # ددی څخه مطلب دادی چی دا باید تکرار رانه شي مثال یوکتاب جاوا دی لیکوال یی ایمل دی بیاباید دا تکرارنه شي یایی بایدلیکوال یا کتاب تغیر ولري
    def __str__(self):
        return f"{self.title} ({self.isbn})"

    def clean(self):
        super().clean() # مخکې له دی چی ډیټاذخیره شي اول دا فنکشن کال کیږي که ایرر وي ډیټابه نه ذخیره کیږي که ایرر نه وي بیابه ذخیره کیږي
        if self.available_quantity > self.quantity:
            raise ValidationError({'available_quantity': 'Available quantity cannot exceed total quantity.'})

