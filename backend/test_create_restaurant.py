"""
Test script to demonstrate creating restaurants via the API
"""
import requests
import json

# API Configuration
BASE_URL = 'http://127.0.0.1:8000'
LOGIN_URL = f'{BASE_URL}/api/accounts/login/'
RESTAURANTS_URL = f'{BASE_URL}/api/restaurants/'

# Test credentials (admin user)
credentials = {
    'email': 'admin@restaurant.com',
    'password': 'admin123'  # Update with actual password
}

def login():
    """Login and get authentication token"""
    print('1. Logging in...')
    response = requests.post(LOGIN_URL, json=credentials)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token') or data.get('access')
        print(f'   ✓ Login successful! Token: {token[:20]}...')
        return token
    else:
        print(f'   ✗ Login failed: {response.status_code}')
        print(f'   Response: {response.text}')
        return None

def create_restaurant(token):
    """Create a new restaurant"""
    print('\n2. Creating restaurant...')
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    restaurant_data = {
        'name': 'La Bella Vista',
        'description': 'Authentic Italian cuisine with a modern twist',
        'cuisine_type': 'Italian',
        'address': '123 Main Street, Downtown',
        'phone_number': '+1234567890',
        'email': 'info@labellavista.com',
        'price_range': '$$',
        'opening_hours': {
            'monday': '11:00-22:00',
            'tuesday': '11:00-22:00',
            'wednesday': '11:00-22:00',
            'thursday': '11:00-22:00',
            'friday': '11:00-23:00',
            'saturday': '10:00-23:00',
            'sunday': '10:00-21:00'
        },
        'features': ['outdoor_seating', 'wifi', 'parking'],
        'delivery_fee': '3.99',
        'delivery_time': '30-45 min',
        'min_order': '15.00',
        'is_active': True
    }
    
    response = requests.post(RESTAURANTS_URL, json=restaurant_data, headers=headers)
    
    if response.status_code == 201:
        data = response.json()
        print(f'   ✓ Restaurant created successfully!')
        print(f'   Name: {data.get("name")}')
        print(f'   Slug: {data.get("slug")}')
        print(f'   ID: {data.get("id")}')
        return data
    else:
        print(f'   ✗ Failed to create restaurant: {response.status_code}')
        print(f'   Response: {response.text}')
        return None

def list_restaurants():
    """List all restaurants"""
    print('\n3. Fetching all restaurants...')
    response = requests.get(RESTAURANTS_URL)
    
    if response.status_code == 200:
        restaurants = response.json()
        results = restaurants.get('results', restaurants) if isinstance(restaurants, dict) else restaurants
        print(f'   ✓ Found {len(results)} restaurants:')
        for r in results:
            print(f'     - {r.get("name")} ({r.get("cuisine_type")})')
    else:
        print(f'   ✗ Failed to fetch restaurants: {response.status_code}')

if __name__ == '__main__':
    print('=' * 60)
    print('RESTAURANT API - CREATE TEST')
    print('=' * 60)
    
    # Login
    token = login()
    
    if not token:
        print('\n❌ Cannot proceed without authentication token')
        print('\nTroubleshooting:')
        print('1. Make sure the server is running: python manage.py runserver')
        print('2. Update the password in credentials dictionary')
        print('3. Create a vendor user if needed')
        exit(1)
    
    # Create restaurant
    restaurant = create_restaurant(token)
    
    # List all restaurants
    list_restaurants()
    
    print('\n' + '=' * 60)
    print('Test completed!')
    print('=' * 60)
