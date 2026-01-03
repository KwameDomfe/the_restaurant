"""
Test script to verify restaurant image can be updated
"""
import requests
import io
from PIL import Image

# API Configuration
BASE_URL = 'http://127.0.0.1:8000'
LOGIN_URL = f'{BASE_URL}/api/accounts/login/'
RESTAURANTS_URL = f'{BASE_URL}/api/restaurants/'

# Login credentials
credentials = {
    'email': 'admin@restaurant.com',
    'password': 'admin123'
}

def login():
    """Login and get authentication token"""
    print('1. Logging in...')
    response = requests.post(LOGIN_URL, json=credentials)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token') or data.get('access')
        print(f'   ✓ Login successful!')
        return token
    else:
        print(f'   ✗ Login failed: {response.status_code}')
        print(f'   Response: {response.text}')
        return None

def get_first_restaurant(token):
    """Get the first restaurant"""
    print('\n2. Getting restaurants...')
    
    headers = {'Authorization': f'Token {token}'}
    response = requests.get(f'{RESTAURANTS_URL}my-restaurants/', headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        restaurants = data.get('results', data) if isinstance(data, dict) else data
        
        if restaurants:
            restaurant = restaurants[0]
            print(f'   ✓ Found restaurant: {restaurant["name"]}')
            print(f'   Slug: {restaurant["slug"]}')
            print(f'   Current image: {restaurant.get("image", "None")[:50]}...' if restaurant.get("image") else '   Current image: None')
            return restaurant
        else:
            print('   ✗ No restaurants found')
            return None
    else:
        print(f'   ✗ Failed to get restaurants: {response.status_code}')
        return None

def create_test_image():
    """Create a simple test image in memory"""
    # Create a 300x200 red image
    img = Image.new('RGB', (300, 200), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def update_restaurant_image(token, restaurant_slug):
    """Update restaurant image"""
    print('\n3. Updating restaurant image...')
    
    headers = {'Authorization': f'Token {token}'}
    
    # Create test image
    img_bytes = create_test_image()
    
    # Prepare multipart form data
    files = {
        'image': ('test_image.jpg', img_bytes, 'image/jpeg')
    }
    
    data = {
        'name': 'Updated Restaurant Name',  # Must include required fields
        'description': 'Updated description with new image',
        'cuisine_type': 'Italian',
        'address': '123 Updated St',
        'price_range': '$$'
    }
    
    response = requests.patch(
        f'{RESTAURANTS_URL}{restaurant_slug}/',
        data=data,
        files=files,
        headers=headers
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        print(f'   ✓ Image updated successfully!')
        print(f'   New image URL: {result.get("image", "None")[:80]}...' if result.get("image") else '   New image: None')
        return result
    else:
        print(f'   ✗ Failed to update image: {response.status_code}')
        print(f'   Response: {response.text}')
        return None

if __name__ == '__main__':
    print('=' * 70)
    print('RESTAURANT IMAGE UPDATE TEST')
    print('=' * 70)
    
    # Login
    token = login()
    if not token:
        print('\n❌ Cannot proceed without authentication token')
        exit(1)
    
    # Get first restaurant
    restaurant = get_first_restaurant(token)
    if not restaurant:
        print('\n❌ No restaurant to update')
        exit(1)
    
    # Update image
    result = update_restaurant_image(token, restaurant['slug'])
    
    print('\n' + '=' * 70)
    if result:
        print('✅ Test completed successfully!')
    else:
        print('❌ Test failed')
    print('=' * 70)
