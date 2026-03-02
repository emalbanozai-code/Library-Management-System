from decimal import Decimal

from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'photo',
            'photo_url',
            'phone',
            'email',
            'address',
            'gender',
            'total_purchases',
            'discount_percent',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'full_name', 'photo_url', 'created_at', 'updated_at']

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo.url

    def validate_total_purchases(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError('Total purchases cannot be negative.')
        return value

    def validate_discount_percent(self, value):
        if value < Decimal('0.00') or value > Decimal('100.00'):
            raise serializers.ValidationError('Discount percent must be between 0 and 100.')
        return value

