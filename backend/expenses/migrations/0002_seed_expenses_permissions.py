from django.db import migrations


PERMISSION_ACTIONS = ['view', 'add', 'change', 'delete', 'all']


def seed_expenses_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')

    for action in PERMISSION_ACTIONS:
        Permission.objects.get_or_create(
            module='expenses',
            action=action,
            defaults={'description': f'{action.title()} permission for expenses module'},
        )


def remove_expenses_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')
    Permission.objects.filter(module='expenses', action__in=PERMISSION_ACTIONS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0006_alter_permission_module'),
        ('expenses', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_expenses_permissions, remove_expenses_permissions),
    ]
