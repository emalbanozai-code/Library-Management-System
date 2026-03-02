from django.contrib import admin

from .models import Customer, Sale, SaleItem


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = [
        'full_name',
        'phone',
        'email',
        'is_active',
        'total_completed_sales',
        'total_spent',
        'last_purchase_date',
    ]
    search_fields = ['full_name', 'phone', 'email']
    list_filter = ['is_active', 'created_at']
    readonly_fields = ['total_completed_sales', 'total_spent', 'last_purchase_date', 'created_at', 'updated_at']


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ['book_title_snapshot', 'book_isbn_snapshot', 'subtotal']


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'sale_date',
        'customer',
        'status',
        'subtotal_amount',
        'discount_amount',
        'total_amount',
        'completed_at',
        'cancelled_at',
    ]
    search_fields = ['id', 'customer__full_name', 'customer__phone']
    list_filter = ['status', 'sale_date', 'created_at']
    readonly_fields = [
        'subtotal_amount',
        'discount_percent',
        'discount_amount',
        'total_amount',
        'completed_at',
        'cancelled_at',
        'created_at',
        'updated_at',
    ]
    inlines = [SaleItemInline]


@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ['sale', 'book', 'quantity', 'unit_price', 'subtotal']
    search_fields = ['sale__id', 'book_title_snapshot', 'book_isbn_snapshot']
    list_filter = ['sale__status']

