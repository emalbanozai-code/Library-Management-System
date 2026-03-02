from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, CustomerViewSet, SaleViewSet

app_name = 'library'

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'sales', SaleViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
]

