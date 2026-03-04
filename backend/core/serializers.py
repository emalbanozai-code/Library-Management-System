from rest_framework import serializers

from accounts.models import ROLE_CHOICES, RolePermission, User
from .models import (
    Settings, Notification
)


class ShopSettingsSerializer(serializers.Serializer):
    shop_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    contact_email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            if value is not None:
                Settings.set_setting(
                    key=key,
                    value=value,
                    setting_type='string',
                    category='general',
                    description=f"{key.replace('_', ' ').capitalize()} of the library"
                )
        return validated_data

    def create(self, validated_data):
        return self.update(None, validated_data)

        
class EmailSettingsSerializer(serializers.Serializer):
    smtp_host = serializers.CharField(required=False, allow_blank=True)
    smtp_port = serializers.CharField(required=False, allow_blank=True)  # Accept as string first
    smtp_username = serializers.CharField(required=False, allow_blank=True)
    smtp_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    from_email = serializers.EmailField(required=False, allow_blank=True)

    def validate_smtp_port(self, value):
        # Skip empty values
        if value in [None, ""]:
            return None
        try:
            return int(value)
        except ValueError:
            raise serializers.ValidationError("smtp_port must be an integer.")

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            if value not in [None, ""]:
                setting_type = 'integer' if key == 'smtp_port' else 'string'
                Settings.set_setting(
                    key=key,
                    value=value,
                    setting_type=setting_type,
                    category='notifications',
                    description=f"{key.replace('_', ' ').capitalize()} for email configuration"
                )
        return validated_data

    def create(self, validated_data):
        return self.update(None, validated_data)


class SystemSettingsSerializer(serializers.Serializer):
    max_books_per_member = serializers.IntegerField(required=False, min_value=1)
    max_lending_days = serializers.IntegerField(required=False, min_value=1)
    fine_per_day = serializers.DecimalField(required=False, max_digits=8, decimal_places=2, min_value=0)
    allow_renewal = serializers.BooleanField(required=False)

    def update(self, instance, validated_data):
        type_map = {
            'max_books_per_member': 'integer',
            'max_lending_days': 'integer',
            'fine_per_day': 'float',
            'allow_renewal': 'boolean',
        }

        for key, value in validated_data.items():
            if value is None:
                continue

            Settings.set_setting(
                key=key,
                value=value,
                setting_type=type_map[key],
                category='general',
                description=f"{key.replace('_', ' ').capitalize()} for library system behavior",
            )
        return validated_data

    def create(self, validated_data):
        return self.update(None, validated_data)


class SettingsUserListSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)
    role = serializers.CharField(source='role_name', read_only=True)
    status = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    lastLogin = serializers.DateTimeField(source='last_login', read_only=True, allow_null=True)
    avatarUrl = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'firstName',
            'lastName',
            'username',
            'email',
            'phone',
            'role',
            'status',
            'createdAt',
            'lastLogin',
            'avatarUrl',
            'permissions',
        ]

    def get_status(self, obj):
        return 'active' if obj.is_active else 'inactive'

    def get_avatarUrl(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            raw_url = obj.profile_picture.url
            return request.build_absolute_uri(raw_url) if request else raw_url
        return None

    def get_permissions(self, obj):
        permissions = set()

        if obj.role_name:
            role_permissions = RolePermission.objects.filter(role_name=obj.role_name).select_related('permission')
            for rp in role_permissions:
                permissions.add(rp.permission.module)

        user_permissions = obj.users_permissions.filter(allow=True).select_related('permission')
        for up in user_permissions:
            permissions.add(up.permission.module)

        denied_permissions = obj.users_permissions.filter(allow=False).select_related('permission')
        for dp in denied_permissions:
            permissions.discard(dp.permission.module)

        return list(permissions)


class SettingsUserWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'username',
            'email',
            'phone',
            'role_name',
            'is_active',
        ]
        extra_kwargs = {
            'role_name': {'required': False},
            'is_active': {'required': False},
        }

    def validate_username(self, value):
        qs = User.objects.filter(username=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        qs = User.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_role_name(self, role_name):
        if role_name == 'admin':
            raise serializers.ValidationError("Invalid Role Name")
        valid_roles = [role[0] for role in ROLE_CHOICES]
        if role_name not in valid_roles:
            raise serializers.ValidationError("Invalid Role Name")
        return role_name


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'notification_type',
            'is_read',
            'created_at',
            'read_at',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'id': data['id'],
            'title': data['title'],
            'message': data['message'],
            'type': data['notification_type'],
            'isRead': data['is_read'],
            'createdAt': data['created_at'],
            'readAt': data['read_at'],
        }


class NotificationCreateSerializer(serializers.ModelSerializer):
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True),
        source='recipient',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Notification
        fields = [
            'title',
            'message',
            'notification_type',
            'recipient_id',
        ]
