from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='permission',
            name='module',
            field=models.CharField(
                choices=[
                    ('users', 'Users'),
                    ('books', 'Books'),
                    ('inventory', 'Inventory'),
                    ('sales', 'Sales'),
                    ('purchases', 'Purchases'),
                    ('customers', 'Customers'),
                    ('finance', 'Finance'),
                    ('reports', 'Reports'),
                    ('settings', 'Settings'),
                    ('product_details', 'Product Details'),
                    ('expense', 'Expense'),
                    ('stock_and_warehouse', 'Stock and Warehouse'),
                    ('currency', 'Currency'),
                    ('units', 'Units'),
                    ('discount', 'Discount'),
                    ('students', 'Students'),
                    ('guardians', 'Guardians'),
                    ('teachers', 'Teachers'),
                    ('staff', 'Staff'),
                    ('classes', 'Classes'),
                    ('attendance', 'Attendance'),
                    ('grades', 'Grades'),
                    ('fees', 'Fees'),
                    ('library', 'Library'),
                    ('exam', 'Exam'),
                ],
                max_length=50,
            ),
        ),
    ]

