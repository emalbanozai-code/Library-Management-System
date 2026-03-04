from rest_framework import serializers

from .models import Book, BookCategory


class BookCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCategory
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        normalized_name = value.strip()
        queryset = BookCategory.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)
        if queryset.exists():
            raise serializers.ValidationError('Category with this name already exists.')
        return normalized_name


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'isbn',
            'category',
            'category_name',
            'price',
            'rentable',
            'quantity',
            'publisher',
            'publish_date',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price cannot be negative.')
        return value

    def validate(self, attrs):
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', 0))

        if quantity < 0:
            raise serializers.ValidationError({'quantity': 'Quantity cannot be negative.'})
        return attrs
