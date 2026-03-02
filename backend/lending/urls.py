from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LendingViewSet

app_name = 'lending'

router = DefaultRouter()
router.register(r'', LendingViewSet, basename='lending')

urlpatterns = [
    path('', include(router.urls)),
]

