from django.contrib import admin

from .models import Book, BookCategory


@admin.register(BookCategory)
class BookCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


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
        'publish_date',
        'created_at',
    ]
    search_fields = ['title', 'author', 'isbn', 'category__name']
    list_filter = ['category', 'rentable', 'publish_date', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
