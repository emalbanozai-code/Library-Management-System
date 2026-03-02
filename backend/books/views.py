from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import BookFilter
from .models import Book
from .serializers import BookSerializer


class BookViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-created_at') # اول ددی قیوری سیټ مطلب دادی چی څومره ډیتاباید دلته په دغه ویوسیټ کی کنټرول شي دوهم دغه نوې ډیټا کله موږ اضافه کوو هغه به سرته راخي ځکه موږ دغه په آرډربای کی کریټیډ اټ منفي نیولی 
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'books'
    permission_action = 'auto'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BookFilter
    search_fields = ['title', 'author', 'isbn', 'category', 'publisher']
    ordering_fields = [ #ولیکلودا اول ګوري چی په ټایټل کې دی کنه که وو خو صحیح که نوو بیایی په پرایس کی ګورط همداسی په ترتیب  ja ددی څخه مطلب دادی دغه سرچ کوو اول باید دکالم سره مچ شي لکه موږ 
        'title',
        'price',
        'publish_date',
        'quantity',
        'available_quantity',
        'created_at',
        'updated_at',
    ]
    pagination_class = StandardResultsSetPagination

