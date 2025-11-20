import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'therestaurant.settings')
django.setup()

from restaurants.models import Restaurant

# Update Sakura Sushi Bar to Japanese
try:
    sakura = Restaurant.objects.get(name__icontains='Sakura')
    sakura.cuisine_type = 'Japanese'
    sakura.save()
    print(f'✓ Updated {sakura.name}: {sakura.cuisine_type}')
except Restaurant.DoesNotExist:
    print('✗ Sakura Sushi Bar not found')

# Display all current restaurants
print('\nCurrent Restaurants:')
for r in Restaurant.objects.all():
    print(f'  • {r.name}: {r.cuisine_type}')

print('\nPopular Cuisines Summary:')
from django.db.models import Count, Avg
cuisines = (
    Restaurant.objects
    .filter(is_active=True)
    .values('cuisine_type')
    .annotate(
        restaurant_count=Count('id'),
        avg_rating=Avg('rating')
    )
    .filter(restaurant_count__gt=0)
    .order_by('-restaurant_count', '-avg_rating')
)

for cuisine in cuisines:
    print(f"  • {cuisine['cuisine_type']}: {cuisine['restaurant_count']} restaurant(s), avg rating: {cuisine['avg_rating']:.1f}")
