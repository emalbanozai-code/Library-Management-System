from django.db import migrations


PERMISSION_ACTIONS = ['view', 'add', 'change', 'delete', 'all']


def seed_employee_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')

    for action in PERMISSION_ACTIONS:
        Permission.objects.get_or_create(
            module='employees',
            action=action,
            defaults={'description': f'{action.title()} permission for employees module'},
        )


def remove_employee_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')
    Permission.objects.filter(module='employees', action__in=PERMISSION_ACTIONS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0004_alter_permission_module'),
        ('employees', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_employee_permissions, remove_employee_permissions),
    ]
