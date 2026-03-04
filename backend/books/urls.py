from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookCategoryViewSet, BookViewSet

app_name = 'books'

router = DefaultRouter()
router.register(r'categories', BookCategoryViewSet, basename='book-category')
router.register(r'', BookViewSet, basename='book')

urlpatterns = [
    path('', include(router.urls)),
]
