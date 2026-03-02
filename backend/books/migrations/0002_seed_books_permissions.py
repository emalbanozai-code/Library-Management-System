from django.db import migrations


PERMISSION_ACTIONS = ['view', 'add', 'change', 'delete', 'all']


def seed_books_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')

    for action in PERMISSION_ACTIONS:
        Permission.objects.get_or_create(
            module='books',
            action=action,
            defaults={'description': f'{action.title()} permission for books module'},
        )


def remove_books_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')
    Permission.objects.filter(module='books', action__in=PERMISSION_ACTIONS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0001_initial'),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_books_permissions, remove_books_permissions),
    ]

