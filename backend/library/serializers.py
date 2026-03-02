from books.serializers import BookSerializer
from sales.serializers import (
    CustomerPurchaseHistorySerializer,
    CustomerSerializer,
    SaleItemReadSerializer,
    SaleItemWriteSerializer,
    SaleSerializer,
)

__all__ = [
    'BookSerializer',
    'CustomerSerializer',
    'SaleItemWriteSerializer',
    'SaleItemReadSerializer',
    'SaleSerializer',
    'CustomerPurchaseHistorySerializer',
]

