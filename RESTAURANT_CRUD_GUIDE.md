# Restaurant CRUD Operations Guide

## Problem
You cannot create restaurants at `http://127.0.0.1:8000/api/restaurants/` without authentication.

## Solution
The restaurant creation endpoint **requires authentication** and specific user permissions.

## Requirements to Create Restaurants

### 1. Authentication Required
You must be logged in with a valid user account.

### 2. User Type Required
Only these user types can create restaurants:
- **`vendor`** - Restaurant owners
- **`platform_admin`** - Platform administrators

### 3. Your Available User
- **Username**: `admin`
- **Email**: `admin@restaurant.com`
- **Type**: `platform_admin`

## How to Create Restaurants

### Method 1: Using the Test Script

```bash
cd backend
python test_create_restaurant.py
```

**Before running**, update the password in the script if needed (line 15).

### Method 2: Using cURL

```bash
# Step 1: Login to get token
curl -X POST http://127.0.0.1:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}'

# Response will include: {"token":"your-auth-token-here",...}

# Step 2: Create restaurant with token
curl -X POST http://127.0.0.1:8000/api/restaurants/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -d '{
    "name": "Amazing Restaurant",
    "description": "Great food and atmosphere",
    "cuisine_type": "Italian",
    "address": "123 Main St",
    "phone_number": "+1234567890",
    "email": "info@amazing.com",
    "price_range": "$$",
    "opening_hours": {"monday": "11:00-22:00"},
    "features": ["wifi", "parking"],
    "delivery_fee": "3.99",
    "delivery_time": "30-45 min",
    "min_order": "15.00",
    "is_active": true
  }'
```

### Method 3: Using Python Requests

```python
import requests

# Login
response = requests.post('http://127.0.0.1:8000/api/accounts/login/', 
    json={'email': 'admin@restaurant.com', 'password': 'admin123'})
token = response.json()['token']

# Create restaurant
headers = {'Authorization': f'Token {token}'}
restaurant = {
    'name': 'My Restaurant',
    'cuisine_type': 'Italian',
    'address': '123 Main St',
    'description': 'Great food',
    'price_range': '$$'
}
response = requests.post('http://127.0.0.1:8000/api/restaurants/', 
    json=restaurant, headers=headers)
print(response.json())
```

### Method 4: Using Postman/Thunder Client

1. **Create Login Request**
   - Method: `POST`
   - URL: `http://127.0.0.1:8000/api/accounts/login/`
   - Body (JSON):
     ```json
     {
       "email": "admin@restaurant.com",
       "password": "admin123"
     }
     ```
   - Copy the `token` from response

2. **Create Restaurant Request**
   - Method: `POST`
   - URL: `http://127.0.0.1:8000/api/restaurants/`
   - Headers:
     - `Content-Type`: `application/json`
     - `Authorization`: `Token YOUR_TOKEN_HERE`
   - Body (JSON):
     ```json
     {
       "name": "Amazing Restaurant",
       "description": "Great food",
       "cuisine_type": "Italian",
       "address": "123 Main St",
       "phone_number": "+1234567890",
       "email": "info@restaurant.com",
       "price_range": "$$",
       "is_active": true
     }
     ```

## Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Restaurant name | "La Bella Vista" |
| `description` | string | Restaurant description | "Authentic Italian cuisine" |
| `cuisine_type` | string | Type of cuisine | "Italian", "Japanese", "Mexican" |
| `address` | string | Physical address | "123 Main Street" |
| `price_range` | string | Price range | "$", "$$", "$$$", "$$$$" |

## Optional Fields

- `phone_number` - Contact phone
- `email` - Contact email
- `website` - Restaurant website URL
- `image` - Restaurant image (file upload)
- `opening_hours` - Operating hours (JSON object)
- `features` - Array of features: `["wifi", "parking", "outdoor_seating"]`
- `delivery_fee` - Delivery cost (decimal)
- `delivery_time` - Estimated delivery time (string)
- `min_order` - Minimum order amount (decimal)
- `is_active` - Active status (boolean, default: true)

## Full CRUD Operations

### Create (POST)
```
POST /api/restaurants/
Headers: Authorization: Token <token>
Body: JSON restaurant data
```

### Read (GET)
```
# List all restaurants (public)
GET /api/restaurants/

# Get single restaurant by slug (public)
GET /api/restaurants/{slug}/

# Get my restaurants (authenticated)
GET /api/restaurants/my-restaurants/
```

### Update (PUT/PATCH)
```
# Only owners or admins can update
PUT /api/restaurants/{slug}/
Headers: Authorization: Token <token>
Body: Complete restaurant data

PATCH /api/restaurants/{slug}/
Headers: Authorization: Token <token>
Body: Partial restaurant data
```

### Delete (DELETE)
```
# Only owners or admins can delete
DELETE /api/restaurants/{slug}/
Headers: Authorization: Token <token>
```

## Creating Additional Vendor Users

If you need to create more vendor accounts:

```python
# Run in Django shell
python manage.py shell

from django.contrib.auth import get_user_model
User = get_user_model()

vendor = User.objects.create_user(
    username='johndoe',
    email='john@example.com',
    password='password123',
    user_type='vendor',
    first_name='John',
    last_name='Doe',
    is_active=True
)
print(f'Vendor created: {vendor.username}')
```

## Troubleshooting

### Error: "Authentication credentials were not provided"
- You forgot to include the `Authorization` header
- Include: `Authorization: Token YOUR_TOKEN`

### Error: "You do not have permission to perform this action"
- Your user is not a `vendor` or `platform_admin`
- Create or use a vendor/admin account

### Error: "Invalid token"
- Token expired or incorrect
- Login again to get a fresh token

### Error: "This field is required"
- Missing required fields in request body
- Check that you included: name, description, cuisine_type, address, price_range

## API Documentation

For complete API documentation with all endpoints:
- Swagger UI: http://127.0.0.1:8000/api/docs/
- ReDoc: http://127.0.0.1:8000/api/redoc/
- Schema: http://127.0.0.1:8000/api/schema/

## Testing

Run the test script to verify everything works:
```bash
cd backend
python test_create_restaurant.py
```

This will:
1. Login with admin credentials
2. Create a test restaurant
3. List all restaurants to confirm creation
