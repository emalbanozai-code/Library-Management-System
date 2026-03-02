from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by_name = serializers.SerializerMethodField()
    paid_by_username = serializers.CharField(source='paid_by.user.username', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'title',
            'description',
            'amount',
            'payment_date',
            'paid_by',
            'paid_by_name',
            'paid_by_username',
            'category',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'paid_by_name', 'paid_by_username', 'created_at', 'updated_at']

    def get_paid_by_name(self, obj):
        full_name = obj.paid_by.user.get_full_name().strip()
        if full_name:
            return full_name
        return obj.paid_by.user.username

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Title is required.')
        return value

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate_payment_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError('Payment date cannot be in the future.')
        return value

