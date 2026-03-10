from django.db import migrations, models


ROLE_CHOICES = [
    ("admin", "Administrator"),
    ("user_creator", "User Creator"),
    ("receptionist", "Receptionist"),
    ("viewer", "Viewer"),
]

USER_PERMISSION_ACTIONS = ["view", "add", "change", "delete", "all"]


def seed_user_creator_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    for action in USER_PERMISSION_ACTIONS:
        Permission.objects.get_or_create(
            module="users",
            action=action,
            defaults={"description": f"{action.title()} permission for users module"},
        )

    for action in ["view", "add"]:
        permission = Permission.objects.get(module="users", action=action)
        RolePermission.objects.get_or_create(
            role_name="user_creator",
            permission=permission,
        )

    RolePermission.objects.filter(
        role_name="user_creator",
        permission__module="users",
        permission__action__in=["change", "delete", "all"],
    ).delete()


def unseed_user_creator_permissions(apps, schema_editor):
    RolePermission = apps.get_model("accounts", "RolePermission")
    RolePermission.objects.filter(role_name="user_creator", permission__module="users").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_profile_picture"),
        ("core", "0007_notification"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role_name",
            field=models.CharField(
                choices=ROLE_CHOICES,
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name="rolepermission",
            name="role_name",
            field=models.CharField(
                choices=ROLE_CHOICES,
                max_length=50,
            ),
        ),
        migrations.RunPython(seed_user_creator_permissions, unseed_user_creator_permissions),
    ]
