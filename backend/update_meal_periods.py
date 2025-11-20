import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'therestaurant.settings')
django.setup()

from restaurants.models import MenuCategory

# Update meal periods for demonstration
MenuCategory.objects.filter(name='Smoothies').update(meal_period='breakfast')
MenuCategory.objects.filter(name='Power Bowls').update(meal_period='lunch')
MenuCategory.objects.filter(name='Pasta').update(meal_period='dinner')
MenuCategory.objects.filter(name='Pepper Soup').update(meal_period='supper')

print('Updated meal periods:')
for cat in MenuCategory.objects.all():
    print(f'  - {cat.name}: {cat.meal_period}')
