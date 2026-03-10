from django.db.models import Q
from django.utils import timezone

from accounts.models import User
from books.models import Book
from lending.models import Lending

from .models import Notification, Settings


DEFAULT_LOW_STOCK_THRESHOLD = 5


def is_admin_user(user) -> bool:
    return bool(
        user
        and getattr(user, "is_authenticated", False)
        and user.is_active
        and (user.is_superuser or getattr(user, "role_name", "") == "admin")
    )


def get_low_stock_threshold() -> int:
    setting = Settings.objects.filter(setting_key="low_stock_threshold").first()
    if not setting:
        return DEFAULT_LOW_STOCK_THRESHOLD

    try:
        return int(setting.get_typed_value())
    except (TypeError, ValueError):
        return DEFAULT_LOW_STOCK_THRESHOLD


def _active_admins():
    return User.objects.filter(
        Q(is_superuser=True) | Q(role_name="admin"),
        is_active=True,
        deleted_at__isnull=True,
    ).distinct()


def create_notification(
    *,
    recipient,
    title: str,
    message: str,
    notification_type: str = Notification.TYPE_INFO,
    created_by=None,
    dedupe: bool = True,
):
    if recipient is None:
        return None

    if dedupe:
        existing = (
            Notification.objects.filter(
                recipient=recipient,
                title=title,
                message=message,
            )
            .order_by("-created_at")
            .first()
        )
        if existing:
            return existing

    return Notification.objects.create(
        recipient=recipient,
        created_by=created_by if getattr(created_by, "pk", None) else None,
        title=title,
        message=message,
        notification_type=notification_type,
    )


def notify_admins(
    *,
    title: str,
    message: str,
    notification_type: str = Notification.TYPE_INFO,
    created_by=None,
    dedupe: bool = True,
):
    notifications = []
    for admin in _active_admins():
        notification = create_notification(
            recipient=admin,
            title=title,
            message=message,
            notification_type=notification_type,
            created_by=created_by,
            dedupe=dedupe,
        )
        if notification is not None:
            notifications.append(notification)
    return notifications


def notify_customer_created(customer, actor=None):
    return notify_admins(
        title="New customer added",
        message=f'Customer "{customer.full_name}" was added with ID #{customer.id}.',
        notification_type=Notification.TYPE_SUCCESS,
        created_by=actor,
    )


def notify_employee_created(employee, actor=None):
    full_name = employee.user.get_full_name().strip() or employee.user.username
    return notify_admins(
        title="New employee added",
        message=f'Employee "{full_name}" was added with username "{employee.user.username}".',
        notification_type=Notification.TYPE_SUCCESS,
        created_by=actor,
    )


def notify_sale_created(sale, actor=None):
    customer_name = sale.customer.full_name if sale.customer_id else "Walk-in customer"
    return notify_admins(
        title="New sale recorded",
        message=f"Sale #{sale.id} was recorded for {customer_name}. Total: {sale.total_amount}.",
        notification_type=Notification.TYPE_SUCCESS,
        created_by=actor,
    )


def _low_stock_notification_payload(book: Book):
    if book.quantity <= 0:
        return {
            "title": "Book out of stock",
            "message": f'Book "{book.title}" (ISBN: {book.isbn}) is out of stock.',
            "notification_type": Notification.TYPE_ERROR,
        }

    return {
        "title": "Low stock alert",
        "message": f'Book "{book.title}" (ISBN: {book.isbn}) has reached the low stock threshold.',
        "notification_type": Notification.TYPE_WARNING,
    }


def notify_book_stock_transition(book: Book, previous_quantity: int | None = None, actor=None):
    threshold = get_low_stock_threshold()
    current_quantity = book.quantity

    if previous_quantity is None:
        previous_quantity = threshold + 1

    if current_quantity == 0 and previous_quantity > 0:
        payload = _low_stock_notification_payload(book)
    elif 0 < current_quantity <= threshold and previous_quantity > threshold:
        payload = _low_stock_notification_payload(book)
    else:
        return []

    return notify_admins(created_by=actor, **payload)


def ensure_runtime_notifications_for_user(user):
    if not is_admin_user(user):
        return

    today = timezone.localdate()
    threshold = get_low_stock_threshold()

    overdue_lendings = Lending.objects.select_related("book", "customer").filter(
        status=Lending.STATUS_NOT_RETURNED,
        end_date__lt=today,
    )
    for lending in overdue_lendings:
        create_notification(
            recipient=user,
            title="Overdue lending alert",
            message=(
                f'Lending #{lending.id} for "{lending.book.title}" to '
                f'{lending.customer.full_name} is overdue since {lending.end_date}.'
            ),
            notification_type=Notification.TYPE_WARNING,
        )

    low_stock_books = Book.objects.filter(quantity__lte=threshold)
    for book in low_stock_books:
        create_notification(recipient=user, **_low_stock_notification_payload(book))
