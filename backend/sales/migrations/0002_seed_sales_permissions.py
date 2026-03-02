from django.db import migrations


PERMISSION_ACTIONS = ['view', 'add', 'change', 'delete', 'all']


def seed_sales_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')

    for action in PERMISSION_ACTIONS:
        Permission.objects.get_or_create(
            module='sales',
            action=action,
            defaults={'description': f'{action.title()} permission for sales module'},
        )


def remove_sales_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')
    Permission.objects.filter(module='sales', action__in=PERMISSION_ACTIONS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0001_initial'),
        ('sales', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_sales_permissions, remove_sales_permissions),
    ]

