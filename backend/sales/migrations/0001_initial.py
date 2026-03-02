from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('books', '0001_initial'),
        ('library', '0004_seed_sales_permissions'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name='Customer',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                        ('updated_at', models.DateTimeField(auto_now=True, db_index=True)),
                        ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                        ('full_name', models.CharField(db_index=True, max_length=255)),
                        ('phone', models.CharField(blank=True, db_index=True, max_length=32)),
                        ('email', models.EmailField(blank=True, db_index=True, max_length=254)),
                        ('is_active', models.BooleanField(default=True)),
                        ('total_completed_sales', models.PositiveIntegerField(default=0)),
                        ('total_spent', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                        ('last_purchase_date', models.DateTimeField(blank=True, null=True)),
                        ('notes', models.TextField(blank=True)),
                    ],
                    options={
                        'db_table': 'customers',
                    },
                ),
                migrations.CreateModel(
                    name='Sale',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                        ('updated_at', models.DateTimeField(auto_now=True, db_index=True)),
                        ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                        ('sale_date', models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
                        ('status', models.CharField(choices=[('draft', 'Draft'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], db_index=True, default='draft', max_length=20)),
                        ('subtotal_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                        ('discount_percent', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                        ('discount_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                        ('total_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                        ('notes', models.TextField(blank=True)),
                        ('completed_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                        ('cancelled_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                        ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sales', to='sales.customer')),
                    ],
                    options={
                        'db_table': 'sales',
                    },
                ),
                migrations.CreateModel(
                    name='SaleItem',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('quantity', models.PositiveIntegerField()),
                        ('unit_price', models.DecimalField(decimal_places=2, max_digits=12)),
                        ('subtotal', models.DecimalField(decimal_places=2, max_digits=12)),
                        ('book_title_snapshot', models.CharField(max_length=255)),
                        ('book_isbn_snapshot', models.CharField(max_length=32)),
                        ('book', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sale_items', to='books.book')),
                        ('sale', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='sales.sale')),
                    ],
                    options={
                        'db_table': 'sale_items',
                        'indexes': [models.Index(fields=['sale'], name='sale_items_sale_id_caf625_idx'), models.Index(fields=['book'], name='sale_items_book_id_99dd57_idx')],
                    },
                ),
                migrations.AddConstraint(
                    model_name='saleitem',
                    constraint=models.UniqueConstraint(fields=('sale', 'book'), name='unique_sale_book_item'),
                ),
                migrations.AddIndex(
                    model_name='sale',
                    index=models.Index(fields=['status'], name='sales_status_a83c6f_idx'),
                ),
                migrations.AddIndex(
                    model_name='sale',
                    index=models.Index(fields=['sale_date'], name='sales_sale_da_0f99d4_idx'),
                ),
                migrations.AddIndex(
                    model_name='sale',
                    index=models.Index(fields=['customer'], name='sales_custome_acc50a_idx'),
                ),
            ],
        ),
    ]

