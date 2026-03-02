from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0001_initial'),
        ('sales', '0001_initial'),
        ('library', '0004_seed_sales_permissions'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.DeleteModel(name='SaleItem'),
                migrations.DeleteModel(name='Sale'),
                migrations.DeleteModel(name='Book'),
                migrations.DeleteModel(name='Customer'),
            ],
        ),
    ]

