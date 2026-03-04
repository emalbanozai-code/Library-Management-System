from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0003_bookcategory_and_book_category_fk'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='book',
            name='available_quantity',
        ),
    ]
