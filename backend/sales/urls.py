from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CustomerViewSet, SaleViewSet

app_name = 'sales'

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'', SaleViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
]
