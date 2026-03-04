from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'core'

router = DefaultRouter()
router.register(r'settings', views.SettingsViewSet, basename='tenant-settings')
router.register(r'settings/users', views.SettingsUsersViewSet, basename='settings-users')
router.register(r'users', views.UsersViewSet, basename='users')
router.register(r'notifications', views.NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
    path('initialize', views.InitializeView.as_view(), name="initialize"),
    path('dashboard/summary', views.DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('reports/system', views.SystemReportView.as_view(), name='system-report'),
]
