from django.db import migrations


PERMISSION_ACTIONS = ['view', 'add', 'change', 'delete', 'all']


def seed_library_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')

    for action in PERMISSION_ACTIONS:
        Permission.objects.get_or_create(
            module='library',
            action=action,
            defaults={'description': f'{action.title()} permission for library module'},
        )


def remove_library_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')
    Permission.objects.filter(module='library', action__in=PERMISSION_ACTIONS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0001_initial'),
        ('library', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_library_permissions, remove_library_permissions),
    ]

