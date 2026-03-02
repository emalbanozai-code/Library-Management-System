from django.contrib import admin

from .models import Lending


@admin.register(Lending)
class LendingAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'book',
        'customer',
        'start_date',
        'end_date',
        'rent_price',
        'status',
        'fine_per_day',
        'late_days',
        'fine_amount',
        'payment_status',
        'payment_method',
        'created_at',
    ]
    list_filter = ['status', 'payment_status', 'payment_method', 'start_date', 'end_date', 'created_at']
    search_fields = [
        'book__title',
        'book__isbn',
        'customer__first_name',
        'customer__last_name',
        'customer__phone',
        'customer__email',
    ]
    readonly_fields = ['late_days', 'fine_amount', 'returned_at', 'created_at', 'updated_at']

