from django.db import migrations, models
import django.db.models.deletion


def migrate_book_categories(apps, schema_editor):
    Book = apps.get_model('books', 'Book')
    BookCategory = apps.get_model('books', 'BookCategory')

    category_cache = {}
    for book in Book.objects.all().iterator():
        category_name = (book.category or '').strip() or 'Uncategorized'
        cache_key = category_name.lower()

        category = category_cache.get(cache_key)
        if category is None:
            category, _ = BookCategory.objects.get_or_create(
                name=category_name,
                defaults={'description': ''},
            )
            category_cache[cache_key] = category

        book.category_ref_id = category.id
        book.save(update_fields=['category_ref'])


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0002_seed_books_permissions'),
    ]

    operations = [
        migrations.CreateModel(
            name='BookCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('name', models.CharField(db_index=True, max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
            ],
            options={
                'db_table': 'book_categories',
            },
        ),
        migrations.AddField(
            model_name='book',
            name='category_ref',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='books',
                to='books.bookcategory',
            ),
        ),
        migrations.RunPython(migrate_book_categories, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='book',
            name='category_ref',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='books',
                to='books.bookcategory',
            ),
        ),
        migrations.RemoveField(
            model_name='book',
            name='category',
        ),
        migrations.RenameField(
            model_name='book',
            old_name='category_ref',
            new_name='category',
        ),
    ]
