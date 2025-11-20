import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'therestaurant.settings')
django.setup()

from restaurants.models import Restaurant

# Mapping from old $ symbols to new GHC
currency_mapping = {
    '$': 'GHC',
    '$$': 'GHC GHC',
    '$$$': 'GHC GHC GHC',
    '$$$$': 'GHC GHC GHC GHC',
}

print('Updating restaurant price ranges from $ to GHC...\n')

restaurants = Restaurant.objects.all()
updated_count = 0

for restaurant in restaurants:
    old_price = restaurant.price_range
    if old_price in currency_mapping:
        restaurant.price_range = currency_mapping[old_price]
        restaurant.save()
        print(f'✓ Updated {restaurant.name}: {old_price} → {restaurant.price_range}')
        updated_count += 1
    else:
        print(f'- {restaurant.name}: {old_price} (no change needed)')

print(f'\n✅ Updated {updated_count} restaurant(s)')

print('\nCurrent restaurants:')
for r in Restaurant.objects.all():
    print(f'  • {r.name}: {r.price_range}')
