from django.contrib.auth import get_user_model
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'therestaurant.settings')
django.setup()

User = get_user_model()
users = User.objects.filter(user_type__in=['vendor', 'platform_admin']).values('username', 'email', 'user_type', 'is_active')

print('\nAvailable vendor/admin users:')
for u in users:
    print(f"- {u['username']} ({u['email']}) - Type: {u['user_type']}, Active: {u['is_active']}")

print(f'\nTotal: {users.count()} users')
