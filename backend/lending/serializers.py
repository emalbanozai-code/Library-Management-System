from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from .models import Lending, quantize_money


class LendingSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)

    class Meta:
        model = Lending
        fields = [
            'id',
            'book',
            'book_title',
            'book_isbn',
            'customer',
            'customer_name',
            'start_date',
            'end_date',
            'rent_price',
            'status',
            'fine_per_day',
            'late_days',
            'fine_amount',
            'payment_status',
            'payment_method',
            'returned_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'book_title',
            'book_isbn',
            'customer_name',
            'late_days',
            'fine_amount',
            'returned_at',
            'created_at',
            'updated_at',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        late_days, fine_amount = self._dynamic_fine(instance)
        data['late_days'] = late_days
        data['fine_amount'] = str(fine_amount)
        return data

    def validate(self, attrs):
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', timezone.localdate()))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        book = attrs.get('book', getattr(self.instance, 'book', None))
        rent_price = attrs.get('rent_price', getattr(self.instance, 'rent_price', Decimal('0.00')))
        fine_per_day = attrs.get('fine_per_day', getattr(self.instance, 'fine_per_day', Decimal('0.00')))

        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'End date cannot be earlier than start date.'})
        if rent_price < 0:
            raise serializers.ValidationError({'rent_price': 'Rent price cannot be negative.'})
        if fine_per_day < 0:
            raise serializers.ValidationError({'fine_per_day': 'Fine per day cannot be negative.'})
        if book is not None and not book.rentable:
            raise serializers.ValidationError({'book': 'Selected book is not rentable.'})
        return attrs

    def create(self, validated_data):
        lending = Lending.objects.create(**validated_data)
        self._sync_fine_fields(lending)
        return lending

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        self._sync_fine_fields(instance)
        return instance

    def _sync_fine_fields(self, lending: Lending):
        if lending.status == Lending.STATUS_RETURNED and lending.returned_at is None:
            lending.returned_at = timezone.now()
        if lending.status == Lending.STATUS_NOT_RETURNED:
            lending.returned_at = None

        reference_date = lending.returned_at.date() if lending.returned_at else timezone.localdate()
        lending.recalculate_fine(reference_date=reference_date)
        lending.save()

    def _dynamic_fine(self, lending: Lending):
        reference_date = lending.returned_at.date() if lending.returned_at else timezone.localdate()
        late_days = max((reference_date - lending.end_date).days, 0)
        fine_amount = quantize_money(Decimal(lending.fine_per_day or Decimal('0.00')) * late_days)
        return late_days, fine_amount


class LendingReturnSerializer(serializers.Serializer):
    payment_status = serializers.ChoiceField(choices=Lending.PAYMENT_STATUS_CHOICES, required=False)
    payment_method = serializers.ChoiceField(choices=Lending.PAYMENT_METHOD_CHOICES, required=False)
