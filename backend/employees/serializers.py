import json

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from accounts.models import ROLE_CHOICES

from .models import Employee


User = get_user_model()
VALID_ROLES = [role for role, _ in ROLE_CHOICES]
WEEKDAY_CHOICES = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
]


class EmployeeListSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    role = serializers.CharField(source='user.role_name', read_only=True)

    work_days = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'phone',
            'email',
            'username',
            'role',
            'father_name',
            'date_of_birth',
            'address',
            'salary',
            'work_days',
            'join_date',
            'membership_type',
            'status',
            'picture',
            'created_at',
            'updated_at',
        ]

    def get_work_days(self, obj):
        try:
            value = json.loads(obj.work_days)
        except (TypeError, ValueError):
            value = []
        return value if isinstance(value, list) else []


class EmployeeDetailSerializer(EmployeeListSerializer):
    pass


class EmployeeWriteSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, required=False, trim_whitespace=False)
    role = serializers.ChoiceField(choices=VALID_ROLES)
    status = serializers.ChoiceField(choices=[choice for choice, _ in Employee.STATUS_CHOICES])
    work_days = serializers.ListField(
        child=serializers.ChoiceField(choices=WEEKDAY_CHOICES),
        allow_empty=False,
    )
    picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'father_name',
            'date_of_birth',
            'address',
            'phone',
            'email',
            'salary',
            'work_days',
            'join_date',
            'membership_type',
            'role',
            'status',
            'username',
            'password',
            'picture',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_username(self, value):
        queryset = User.objects.filter(username=value)
        if self.instance is not None:
            queryset = queryset.exclude(id=self.instance.user_id)
        if queryset.exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate_email(self, value):
        queryset = User.objects.filter(email__iexact=value)
        if self.instance is not None:
            queryset = queryset.exclude(id=self.instance.user_id)
        if queryset.exists():
            raise serializers.ValidationError('Email already exists.')
        return value

    def validate_date_of_birth(self, value):
        if value >= timezone.localdate():
            raise serializers.ValidationError('Date of birth must be in the past.')
        return value

    def validate_salary(self, value):
        if value < 0:
            raise serializers.ValidationError('Salary cannot be negative.')
        return value

    def validate_work_days(self, value):
        if not value:
            raise serializers.ValidationError('At least one work day is required.')
        deduplicated = []
        for day in value:
            if day not in deduplicated:
                deduplicated.append(day)
        return deduplicated

    def validate_password(self, value):
        user = self.instance.user if self.instance is not None else None
        validate_password(value, user)
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'Password is required.'})
        return attrs

    def create(self, validated_data):
        user_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone': validated_data.pop('phone'),
            'email': validated_data.pop('email'),
            'username': validated_data.pop('username'),
            'role_name': validated_data.pop('role'),
        }
        password = validated_data.pop('password')
        status = validated_data.get('status', Employee.STATUS_ACTIVE)

        work_days = validated_data.pop('work_days')
        user = User.objects.create_user(
            **user_data,
            password=password,
            is_active=status == Employee.STATUS_ACTIVE,
        )
        employee = Employee.objects.create(
            user=user,
            work_days=json.dumps(work_days),
            **validated_data,
        )
        return employee

    def update(self, instance, validated_data):
        user = instance.user

        user.first_name = validated_data.pop('first_name', user.first_name)
        user.last_name = validated_data.pop('last_name', user.last_name)
        user.phone = validated_data.pop('phone', user.phone)
        user.email = validated_data.pop('email', user.email)
        user.username = validated_data.pop('username', user.username)
        user.role_name = validated_data.pop('role', user.role_name)

        password = validated_data.pop('password', None)
        if password:
            user.set_password(password)

        status = validated_data.get('status', instance.status)
        user.is_active = status == Employee.STATUS_ACTIVE
        user.save()

        for attr, value in validated_data.items():
            if attr == 'work_days':
                value = json.dumps(value)
            setattr(instance, attr, value)
        instance.save()
        return instance


class EmployeeResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_password(self, value):
        employee = self.context['employee']
        validate_password(value, employee.user)
        return value
