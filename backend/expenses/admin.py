from django.contrib import admin

from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'title',
        'category',
        'amount',
        'payment_date',
        'paid_by',
        'created_at',
    ]
    list_filter = ['category', 'payment_date', 'created_at']
    search_fields = [
        'title',
        'description',
        'paid_by__user__first_name',
        'paid_by__user__last_name',
        'paid_by__user__username',
    ]
    readonly_fields = ['created_at', 'updated_at']

