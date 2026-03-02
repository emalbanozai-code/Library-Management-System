from rest_framework import serializers

from .models import Book


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'isbn',
            'category',
            'price',
            'rentable',
            'quantity',
            'available_quantity',
            'publisher',
            'publish_date',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] # داهغه څه دي چی انپوټ فیلډ نه لري خو کله چی ډیتاذخیره کړودابه ښودل کیږي

    def validate_price(self, value): # دغه اول دفنکشنی نوم دی دوهم بیا دفیلډ نوم دی دوه پارامیټره لري که چی هغه ولیو چی موږیی دپرایس په فیلد کی ورکوو هغهد صفرڅخه کوچنی وه دغه دلاندې میسیج راکړه
        if value < 0:
            raise serializers.ValidationError('Price cannot be negative.')
        return value

    def validate(self, attrs):
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', 0))
        available_quantity = attrs.get('available_quantity', getattr(self.instance, 'available_quantity', 0))

        if available_quantity < 0:
            raise serializers.ValidationError({'available_quantity': 'Available quantity cannot be negative.'})

        if quantity < 0:
            raise serializers.ValidationError({'quantity': 'Quantity cannot be negative.'})

        if available_quantity > quantity:
            raise serializers.ValidationError(
                {'available_quantity': 'Available quantity cannot exceed total quantity.'}
            )
        # attrs['description'] = 'This is one description'
        return attrs

