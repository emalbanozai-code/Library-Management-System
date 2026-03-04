from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers

from books.models import Book

from .models import Customer, Sale, SaleItem


MONEY_QUANTIZE = Decimal('0.01')


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTIZE, rounding=ROUND_HALF_UP)


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'full_name',
            'phone',
            'email',
            'is_active',
            'total_completed_sales',
            'total_spent',
            'last_purchase_date',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'total_completed_sales', 'total_spent', 'last_purchase_date', 'created_at', 'updated_at']


class SaleItemWriteSerializer(serializers.Serializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal('0.00'),
        required=False,
    )


class SaleItemReadSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = SaleItem
        fields = [
            'id',
            'book',
            'book_title',
            'book_title_snapshot',
            'book_isbn_snapshot',
            'quantity',
            'unit_price',
            'subtotal',
        ]


class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    price = serializers.DecimalField(source='subtotal_amount', max_digits=12, decimal_places=2, read_only=True)
    quantity = serializers.SerializerMethodField()
    discount_percent = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal('0.00'),
        max_value=Decimal('100.00'),
        required=False,
    )
    items = SaleItemWriteSerializer(many=True, required=False)

    class Meta:
        model = Sale
        fields = [
            'id',
            'sale_date',
            'customer',
            'customer_name',
            'price',
            'quantity',
            'subtotal_amount',
            'discount_percent',
            'discount_amount',
            'total_amount',
            'notes',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'customer_name',
            'price',
            'quantity',
            'subtotal_amount',
            'discount_amount',
            'total_amount',
            'created_at',
            'updated_at',
        ]

    def get_quantity(self, obj):
        return sum((item.quantity for item in obj.items.all()), start=0)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['items'] = SaleItemReadSerializer(instance.items.all(), many=True).data
        return data

    def validate_items(self, items):
        if not items:
            return items

        seen_book_ids = set()
        for item in items:
            book_id = item['book'].id
            if book_id in seen_book_ids:
                raise serializers.ValidationError('Each book can only appear once in a sale.')
            seen_book_ids.add(book_id)
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        sale = Sale.objects.create(**validated_data)
        self._replace_sale_items(sale, items_data)
        self._recalculate_draft_totals(sale)
        return sale

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            self._replace_sale_items(instance, items_data)

        self._recalculate_draft_totals(instance)
        return instance

    def _replace_sale_items(self, sale: Sale, items_data):
        sale.items.all().delete()
        for item in items_data:
            book = item['book']
            quantity = item['quantity']
            unit_price = item.get('unit_price')
            if unit_price is None:
                unit_price = book.price
            unit_price = quantize_money(Decimal(unit_price))
            subtotal = quantize_money(unit_price * quantity)

            SaleItem.objects.create(
                sale=sale,
                book=book,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal,
                book_title_snapshot=book.title,
                book_isbn_snapshot=book.isbn,
            )

    def _recalculate_draft_totals(self, sale: Sale):
        subtotal = quantize_money(
            sum((item.subtotal for item in sale.items.all()), start=Decimal('0.00'))
        )
        discount_percent = quantize_money(Decimal(sale.discount_percent or Decimal('0.00')))
        discount_percent = max(Decimal('0.00'), min(Decimal('100.00'), discount_percent))
        discount_amount = quantize_money((subtotal * discount_percent) / Decimal('100.00'))
        total_amount = quantize_money(subtotal - discount_amount)
        sale.subtotal_amount = subtotal
        sale.discount_percent = discount_percent
        sale.discount_amount = discount_amount
        sale.total_amount = total_amount
        sale.save(update_fields=['subtotal_amount', 'discount_percent', 'discount_amount', 'total_amount', 'updated_at'])


class CustomerPurchaseHistorySerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id',
            'sale_date',
            'subtotal_amount',
            'discount_percent',
            'discount_amount',
            'total_amount',
            'item_count',
        ]
