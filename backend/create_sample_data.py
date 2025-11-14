#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'therestaurant.settings')
django.setup()

from restaurants.models import Restaurant, MenuCategory, MenuItem
from accounts.models import CustomUser

def create_sample_data():
    # Create sample restaurants
    restaurant_data = [
        {
            'name': 'Bella Vista Italian',
            'description': 'Authentic Italian cuisine with fresh ingredients and traditional recipes.',
            'cuisine_type': 'Italian',
            'address': '123 Main St, Downtown',
            'phone_number': '+1-555-0101',
            'email': 'info@bellavista.com',
            'website': 'https://bellavista.com',
            'price_range': '$$',
            'rating': 4.5,
            'opening_hours': {
                'monday': '11:00-22:00',
                'tuesday': '11:00-22:00',
                'wednesday': '11:00-22:00',
                'thursday': '11:00-22:00',
                'friday': '11:00-23:00',
                'saturday': '11:00-23:00',
                'sunday': '12:00-21:00'
            },
            'features': ['wifi', 'outdoor_seating', 'delivery', 'takeout']
        },
        {
            'name': 'Sakura Sushi Bar',
            'description': 'Fresh sushi and Japanese delicacies in a modern atmosphere.',
            'cuisine_type': 'Japanese',
            'address': '456 Oak Avenue, Midtown',
            'phone_number': '+1-555-0102',
            'email': 'contact@sakurasushi.com',
            'website': 'https://sakurasushi.com',
            'price_range': '$$$',
            'rating': 4.8,
            'opening_hours': {
                'monday': 'closed',
                'tuesday': '17:00-23:00',
                'wednesday': '17:00-23:00',
                'thursday': '17:00-23:00',
                'friday': '17:00-24:00',
                'saturday': '17:00-24:00',
                'sunday': '17:00-22:00'
            },
            'features': ['wifi', 'bar', 'delivery', 'takeout', 'dine_in']
        },
        {
            'name': 'Green Garden Café',
            'description': 'Organic, plant-based meals and fresh juices.',
            'cuisine_type': 'Vegetarian',
            'address': '789 Park Lane, Uptown',
            'phone_number': '+1-555-0103',
            'email': 'hello@greengarden.com',
            'website': 'https://greengarden.com',
            'price_range': '$',
            'rating': 4.3,
            'opening_hours': {
                'monday': '07:00-18:00',
                'tuesday': '07:00-18:00',
                'wednesday': '07:00-18:00',
                'thursday': '07:00-18:00',
                'friday': '07:00-18:00',
                'saturday': '08:00-18:00',
                'sunday': '08:00-16:00'
            },
            'features': ['wifi', 'outdoor_seating', 'delivery', 'takeout', 'healthy_options']
        }
    ]

    restaurants = []
    for data in restaurant_data:
        restaurant, created = Restaurant.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        restaurants.append(restaurant)
        if created:
            print(f"Created restaurant: {restaurant.name}")

    # Create menu categories and items for Bella Vista
    bella_vista = restaurants[0]
    
    appetizers_cat, _ = MenuCategory.objects.get_or_create(
        restaurant=bella_vista,
        name='Appetizers',
        defaults={'description': 'Start your meal with our delicious appetizers', 'display_order': 1}
    )
    
    appetizers_items = [
        {
            'name': 'Bruschetta Trio',
            'description': 'Three varieties of bruschetta with fresh tomatoes, basil, and mozzarella',
            'price': 12.99,
            'ingredients': ['tomatoes', 'basil', 'mozzarella', 'garlic', 'olive_oil'],
            'prep_time': 10,
            'is_vegetarian': True
        },
        {
            'name': 'Calamari Fritti',
            'description': 'Golden fried squid rings served with marinara sauce',
            'price': 15.99,
            'ingredients': ['squid', 'flour', 'marinara_sauce'],
            'prep_time': 12,
            'spice_level': 1
        }
    ]
    
    for item_data in appetizers_items:
        item_data['restaurant'] = bella_vista
        item_data['category'] = appetizers_cat
        MenuItem.objects.get_or_create(name=item_data['name'], defaults=item_data)

    pasta_cat, _ = MenuCategory.objects.get_or_create(
        restaurant=bella_vista,
        name='Pasta',
        defaults={'description': 'Homemade pasta dishes', 'display_order': 2}
    )
    
    pasta_items = [
        {
            'name': 'Spaghetti Carbonara',
            'description': 'Classic Roman pasta with eggs, cheese, pancetta, and black pepper',
            'price': 18.99,
            'ingredients': ['spaghetti', 'eggs', 'pecorino_cheese', 'pancetta', 'black_pepper'],
            'prep_time': 15,
            'spice_level': 1
        },
        {
            'name': 'Penne Arrabbiata',
            'description': 'Spicy tomato sauce with garlic, red chilies, and fresh herbs',
            'price': 16.99,
            'ingredients': ['penne', 'tomato_sauce', 'garlic', 'red_chilies', 'herbs'],
            'prep_time': 12,
            'is_vegetarian': True,
            'spice_level': 3
        }
    ]
    
    for item_data in pasta_items:
        item_data['restaurant'] = bella_vista
        item_data['category'] = pasta_cat
        MenuItem.objects.get_or_create(name=item_data['name'], defaults=item_data)

    # Create menu for Sakura Sushi
    sakura = restaurants[1]
    
    sushi_cat, _ = MenuCategory.objects.get_or_create(
        restaurant=sakura,
        name='Sushi Rolls',
        defaults={'description': 'Fresh sushi rolls made to order', 'display_order': 1}
    )
    
    sushi_items = [
        {
            'name': 'California Roll',
            'description': 'Crab, avocado, and cucumber with sesame seeds',
            'price': 8.99,
            'ingredients': ['crab', 'avocado', 'cucumber', 'sesame_seeds', 'nori'],
            'prep_time': 8
        },
        {
            'name': 'Spicy Tuna Roll',
            'description': 'Fresh tuna with spicy mayo and sriracha',
            'price': 11.99,
            'ingredients': ['tuna', 'spicy_mayo', 'sriracha', 'nori'],
            'prep_time': 8,
            'spice_level': 2
        },
        {
            'name': 'Vegetable Roll',
            'description': 'Cucumber, avocado, carrot, and pickled radish',
            'price': 7.99,
            'ingredients': ['cucumber', 'avocado', 'carrot', 'pickled_radish', 'nori'],
            'prep_time': 6,
            'is_vegetarian': True,
            'is_vegan': True
        }
    ]
    
    for item_data in sushi_items:
        item_data['restaurant'] = sakura
        item_data['category'] = sushi_cat
        MenuItem.objects.get_or_create(name=item_data['name'], defaults=item_data)

    # Create menu for Green Garden Café
    green_garden = restaurants[2]
    
    bowls_cat, _ = MenuCategory.objects.get_or_create(
        restaurant=green_garden,
        name='Power Bowls',
        defaults={'description': 'Nutritious bowls packed with fresh ingredients', 'display_order': 1}
    )
    
    bowl_items = [
        {
            'name': 'Buddha Bowl',
            'description': 'Quinoa, roasted vegetables, chickpeas, and tahini dressing',
            'price': 14.99,
            'ingredients': ['quinoa', 'roasted_vegetables', 'chickpeas', 'tahini'],
            'prep_time': 10,
            'is_vegetarian': True,
            'is_vegan': True,
            'is_gluten_free': True
        },
        {
            'name': 'Green Goddess Bowl',
            'description': 'Kale, avocado, cucumber, sprouts, and green goddess dressing',
            'price': 13.99,
            'ingredients': ['kale', 'avocado', 'cucumber', 'sprouts', 'green_goddess_dressing'],
            'prep_time': 8,
            'is_vegetarian': True,
            'is_vegan': True
        }
    ]
    
    for item_data in bowl_items:
        item_data['restaurant'] = green_garden
        item_data['category'] = bowls_cat
        MenuItem.objects.get_or_create(name=item_data['name'], defaults=item_data)

    smoothies_cat, _ = MenuCategory.objects.get_or_create(
        restaurant=green_garden,
        name='Smoothies',
        defaults={'description': 'Fresh fruit and vegetable smoothies', 'display_order': 2}
    )
    
    smoothie_items = [
        {
            'name': 'Green Machine',
            'description': 'Spinach, apple, banana, ginger, and coconut water',
            'price': 7.99,
            'ingredients': ['spinach', 'apple', 'banana', 'ginger', 'coconut_water'],
            'prep_time': 3,
            'is_vegetarian': True,
            'is_vegan': True
        },
        {
            'name': 'Berry Blast',
            'description': 'Mixed berries, banana, almond milk, and honey',
            'price': 8.99,
            'ingredients': ['mixed_berries', 'banana', 'almond_milk', 'honey'],
            'prep_time': 3,
            'is_vegetarian': True
        }
    ]
    
    for item_data in smoothie_items:
        item_data['restaurant'] = green_garden
        item_data['category'] = smoothies_cat
        MenuItem.objects.get_or_create(name=item_data['name'], defaults=item_data)

    print(f"Sample data created successfully!")
    print(f"Restaurants: {Restaurant.objects.count()}")
    print(f"Menu Categories: {MenuCategory.objects.count()}")
    print(f"Menu Items: {MenuItem.objects.count()}")

if __name__ == '__main__':
    create_sample_data()