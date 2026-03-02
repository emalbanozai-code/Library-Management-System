from django.db import migrations


PERMISSION_ACTIONS = ['view', 'add', 'change', 'delete', 'all']


def _ensure_permission(Permission, module, action, description):
    permission, _ = Permission.objects.get_or_create(
        module=module,
        action=action,
        defaults={'description': description},
    )
    return permission


def _move_permission_links(apps, source_module, target_module):
    Permission = apps.get_model('core', 'Permission')
    RolePermission = apps.get_model('accounts', 'RolePermission')
    UserPermission = apps.get_model('accounts', 'UserPermission')

    source_permissions = Permission.objects.filter(module=source_module)
    for source_permission in source_permissions:
        target_permission = _ensure_permission(
            Permission,
            target_module,
            source_permission.action,
            source_permission.description or f'{source_permission.action.title()} permission for {target_module} module',
        )

        for role_permission in RolePermission.objects.filter(permission_id=source_permission.id):
            exists = RolePermission.objects.filter(
                role_name=role_permission.role_name,
                permission_id=target_permission.id,
            ).exists()
            if exists:
                role_permission.delete()
            else:
                role_permission.permission_id = target_permission.id
                role_permission.save(update_fields=['permission'])

        for user_permission in UserPermission.objects.filter(permission_id=source_permission.id):
            existing = UserPermission.objects.filter(
                user_id=user_permission.user_id,
                permission_id=target_permission.id,
            ).first()
            if existing:
                existing.allow = user_permission.allow
                existing.save(update_fields=['allow'])
                user_permission.delete()
            else:
                user_permission.permission_id = target_permission.id
                user_permission.save(update_fields=['permission'])

    Permission.objects.filter(module=source_module).delete()


def forwards_remap_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')

    for action in PERMISSION_ACTIONS:
        _ensure_permission(
            Permission,
            'books',
            action,
            f'{action.title()} permission for books module',
        )
        _ensure_permission(
            Permission,
            'sales',
            action,
            f'{action.title()} permission for sales module',
        )

    _move_permission_links(apps, 'library', 'books')
    _move_permission_links(apps, 'customers', 'sales')


def reverse_remap_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')
    RolePermission = apps.get_model('accounts', 'RolePermission')
    UserPermission = apps.get_model('accounts', 'UserPermission')

    for action in PERMISSION_ACTIONS:
        library_permission = _ensure_permission(
            Permission,
            'library',
            action,
            f'{action.title()} permission for library module',
        )
        customers_permission = _ensure_permission(
            Permission,
            'customers',
            action,
            f'{action.title()} permission for customers module',
        )

        books_permission = Permission.objects.filter(module='books', action=action).first()
        if books_permission:
            for role_permission in RolePermission.objects.filter(permission_id=books_permission.id):
                RolePermission.objects.get_or_create(
                    role_name=role_permission.role_name,
                    permission_id=library_permission.id,
                )
            for user_permission in UserPermission.objects.filter(permission_id=books_permission.id):
                obj, _ = UserPermission.objects.get_or_create(
                    user_id=user_permission.user_id,
                    permission_id=library_permission.id,
                    defaults={'allow': user_permission.allow},
                )
                if obj.allow != user_permission.allow:
                    obj.allow = user_permission.allow
                    obj.save(update_fields=['allow'])

        sales_permission = Permission.objects.filter(module='sales', action=action).first()
        if sales_permission:
            for role_permission in RolePermission.objects.filter(permission_id=sales_permission.id):
                RolePermission.objects.get_or_create(
                    role_name=role_permission.role_name,
                    permission_id=customers_permission.id,
                )
            for user_permission in UserPermission.objects.filter(permission_id=sales_permission.id):
                obj, _ = UserPermission.objects.get_or_create(
                    user_id=user_permission.user_id,
                    permission_id=customers_permission.id,
                    defaults={'allow': user_permission.allow},
                )
                if obj.allow != user_permission.allow:
                    obj.allow = user_permission.allow
                    obj.save(update_fields=['allow'])


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0002_add_books_module_to_permissions'),
        ('accounts', '0001_initial'),
        ('books', '0002_seed_books_permissions'),
        ('sales', '0002_seed_sales_permissions'),
        ('library', '0005_transfer_models_state_to_books_sales'),
    ]

    operations = [
        migrations.RunPython(forwards_remap_permissions, reverse_remap_permissions),
    ]

