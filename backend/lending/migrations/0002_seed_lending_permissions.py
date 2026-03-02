from django.db import migrations


PERMISSION_ACTIONS = ['view', 'add', 'change', 'delete', 'all']


def seed_lending_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')

    for action in PERMISSION_ACTIONS:
        Permission.objects.get_or_create(
            module='lending',
            action=action,
            defaults={'description': f'{action.title()} permission for lending module'},
        )


def remove_lending_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')
    Permission.objects.filter(module='lending', action__in=PERMISSION_ACTIONS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0004_alter_permission_module'),
        ('lending', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_lending_permissions, remove_lending_permissions),
    ]

