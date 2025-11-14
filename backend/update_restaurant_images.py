#!/usr/bin/env python
"""
Script to update restaurant images with sample URLs
Run this from the backend directory: python update_restaurant_images.py
"""

import os
import sys
import django

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'therestaurant.settings')
django.setup()

from restaurants.models import Restaurant

# Sample image URLs for different cuisine types
cuisine_images = {
    'Italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop&crop=center',
    'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=250&fit=crop&crop=center',
    'Chinese': 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=250&fit=crop&crop=center',
    'Mexican': 'https://images.unsplash.com/photo-1565299585323-38174c2f9a4e?w=400&h=250&fit=crop&crop=center',
    'Indian': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=250&fit=crop&crop=center',
    'American': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop&crop=center',
    'Vegetarian': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=250&fit=crop&crop=center',
    'Thai': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=250&fit=crop&crop=center',
    'French': 'https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=400&h=250&fit=crop&crop=center',
    'Korean': 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=250&fit=crop&crop=center'
}

def update_restaurant_images():
    restaurants = Restaurant.objects.all()
    
    print(f"Found {restaurants.count()} restaurants to update...")
    
    for restaurant in restaurants:
        cuisine_type = restaurant.cuisine_type
        
        # Get appropriate image URL based on cuisine type
        image_url = cuisine_images.get(cuisine_type, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center')
        
        print(f"Updating {restaurant.name} ({cuisine_type}) with image: {image_url}")
        
        # Note: Since we're dealing with ImageField, we'll store the URL as a string
        # We'll modify the serializer to handle this properly
        # For now, let's just print what we would update
        print(f"  Current image: {restaurant.image}")
        print(f"  New image URL: {image_url}")
        
    print("\nTo properly handle images, we need to modify the approach...")
    print("The ImageField expects file uploads, but we can modify the API to return URLs")

if __name__ == '__main__':
    update_restaurant_images()