from django.contrib import admin

from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'author',
        'isbn',
        'category',
        'price',
        'rentable',
        'quantity',
        'available_quantity',
        'publish_date',
        'created_at',
    ]
    search_fields = ['title', 'author', 'isbn']
    list_filter = ['category', 'rentable', 'publish_date', 'created_at']
    readonly_fields = ['created_at', 'updated_at']

