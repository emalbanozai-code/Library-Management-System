from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('library', '0004_seed_sales_permissions'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name='Book',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                        ('updated_at', models.DateTimeField(auto_now=True, db_index=True)),
                        ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                        ('title', models.CharField(db_index=True, max_length=255)),
                        ('author', models.CharField(db_index=True, max_length=255)),
                        ('isbn', models.CharField(db_index=True, max_length=32, unique=True)),
                        ('category', models.CharField(db_index=True, max_length=100)),
                        ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('rentable', models.BooleanField(default=True)),
                        ('quantity', models.PositiveIntegerField(default=0)),
                        ('available_quantity', models.PositiveIntegerField(default=0)),
                        ('publisher', models.CharField(blank=True, db_index=True, max_length=255)),
                        ('publish_date', models.DateField(blank=True, null=True)),
                        ('description', models.TextField(blank=True)),
                    ],
                    options={
                        'db_table': 'books',
                    },
                ),
            ],
        ),
    ]

