from django.contrib import admin

from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'get_full_name',
        'get_username',
        'get_email',
        'get_role',
        'membership_type',
        'status',
        'join_date',
    )
    list_filter = ('status', 'membership_type', 'join_date', 'user__role_name')
    search_fields = (
        'user__first_name',
        'user__last_name',
        'father_name',
        'user__username',
        'user__email',
        'user__phone',
    )
    ordering = ('-created_at',)

    @admin.display(description='Full name')
    def get_full_name(self, obj):
        return obj.user.get_full_name()

    @admin.display(description='Username')
    def get_username(self, obj):
        return obj.user.username

    @admin.display(description='Email')
    def get_email(self, obj):
        return obj.user.email

    @admin.display(description='Role')
    def get_role(self, obj):
        return obj.user.role_name
