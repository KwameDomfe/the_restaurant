# CRUD Operations Implementation for Authenticated Users

## Overview
Added full CRUD (Create, Read, Update, Delete) functionality for authenticated users based on their user roles. The system now supports role-based permissions for managing restaurants and menu items.

## User Roles & Permissions

### Available User Types
- **customer**: Can only view and order
- **vendor**: Can create and manage their own restaurants
- **platform_admin**: Can manage all restaurants and menu items
- **delivery**, **staff**, etc.: Other roles with different permissions

### Permission System
- **Read**: Everyone can view restaurants and available menu items
- **Create**: Vendors and admins can create restaurants
- **Update**: Owners can edit their restaurants, admins can edit all
- **Delete**: Owners can delete their restaurants, admins can delete all

## Backend Changes

### 1. Restaurant Model (`backend/restaurants/models.py`)
```python
class Restaurant(models.Model):
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='owned_restaurants',
        limit_choices_to={'user_type__in': ['vendor', 'platform_admin']},
        null=True, 
        blank=True
    )
    # ... rest of fields
```

### 2. Custom Permissions (`backend/restaurants/views.py`)

#### IsOwnerOrAdminOrReadOnly
- GET: Public access
- POST: Vendors and admins only
- PUT/PATCH/DELETE: Restaurant owners or admins only

#### IsRestaurantOwnerOrAdminOrReadOnly
- Applied to menu items and categories
- Checks if user owns the parent restaurant

### 3. New API Endpoints

#### Restaurant Management
```
GET    /api/restaurants/my-restaurants/     # Get logged-in user's restaurants
POST   /api/restaurants/                    # Create new restaurant
PUT    /api/restaurants/{slug}/             # Update restaurant
DELETE /api/restaurants/{slug}/             # Delete restaurant
```

#### Menu Item Management
```
GET    /api/menu-items/?restaurant={id}     # Get restaurant menu items (includes unavailable for owners)
POST   /api/menu-items/                     # Create menu item
PUT    /api/menu-items/{slug}/              # Update menu item
DELETE /api/menu-items/{slug}/              # Delete menu item
```

### 4. Serializer Updates
- Added `owner`, `owner_name`, and `is_owner` fields to RestaurantListSerializer
- `is_owner` automatically checks if current user owns restaurant or is admin

## Frontend Changes

### 1. New Components

#### RestaurantFormModal (`webapp/src/components/RestaurantFormModal.jsx`)
- Full restaurant creation/editing form
- Image upload with preview
- Feature toggles (wifi, parking, delivery, etc.)
- Price range selection
- Active/inactive toggle

#### MenuItemFormModal (`webapp/src/components/MenuItemFormModal.jsx`)
- Menu item creation/editing form
- Category selection
- Image upload
- Dietary options (vegetarian, vegan, gluten-free)
- Spice level and prep time
- Availability toggle

### 2. Updated Components

#### RestaurantCard (`webapp/src/components/RestaurantCard.js`)
```jsx
// Added edit/delete buttons for owners
{canEdit && (
  <div className="mt-2 d-flex gap-2">
    <button onClick={() => setShowEditModal(true)}>Edit</button>
    <button onClick={handleDelete}>Delete</button>
  </div>
)}
```

#### MenuItemCard (`webapp/src/pages/MenuItemCard.jsx`)
```jsx
// Added edit/delete buttons for restaurant owners
{canEdit && (
  <div className="mt-2 d-flex gap-2">
    <button onClick={() => setShowEditModal(true)}>Edit</button>
    <button onClick={handleDelete}>Delete</button>
  </div>
)}
```

### 3. New Pages

#### VendorDashboard (`webapp/src/pages/VendorDashboard.jsx`)
Features:
- Overview of all restaurants owned by user
- Statistics cards (total restaurants, active restaurants, total menu items)
- Quick "Add Restaurant" button
- Restaurant grid with edit/delete options
- "Manage Menu Items" button for each restaurant
- Permission check (vendors and admins only)

#### ManageRestaurantMenu (`webapp/src/pages/ManageRestaurantMenu.jsx`)
Features:
- Full menu management for specific restaurant
- Breadcrumb navigation
- Statistics (total items, available, unavailable)
- Grid view of all menu items (including unavailable)
- Quick "Add Menu Item" button
- Edit/delete buttons on each item
- Permission check (restaurant owner or admin)

### 4. Routes Added (`webapp/src/App.js`)
```jsx
<Route path="/vendor/dashboard" element={<VendorDashboard />} />
<Route path="/vendor/restaurants/:slug/menu" element={<ManageRestaurantMenu />} />
```

### 5. Navigation Updates (`webapp/src/components/MainHeader.jsx`)
Added "My Restaurants" menu item for vendors and admins:
- Desktop dropdown menu
- Mobile offcanvas menu
- Only visible to vendors and platform_admin users

## Usage Guide

### For Vendors

#### 1. Access Dashboard
- Log in as vendor
- Click profile menu → "My Restaurants"
- Or navigate to `/vendor/dashboard`

#### 2. Create Restaurant
- Click "Add New Restaurant" button
- Fill in required fields:
  - Name, description, cuisine type, address
  - Contact: phone, email
  - Price range ($ to $$$$)
  - Delivery settings (fee, time, minimum order)
- Optional: Upload image, add features, set opening hours
- Click "Save Restaurant"

#### 3. Edit Restaurant
- Find restaurant card in dashboard
- Click "Edit" button
- Modify fields as needed
- Click "Save Restaurant"

#### 4. Delete Restaurant
- Click "Delete" button on restaurant card
- Confirm deletion (this cannot be undone!)

#### 5. Manage Menu Items
- Click "Manage Menu Items" on restaurant card
- Or click "Edit" then navigate to menu management
- Add new items with "Add Menu Item" button
- Edit/delete existing items using buttons on each card

#### 6. Create Menu Item
- Navigate to restaurant's menu management page
- Click "Add Menu Item"
- Fill required fields:
  - Name, description, price
  - Category (select from existing)
- Optional:
  - Spice level (0-5)
  - Prep time
  - Dietary options (vegetarian, vegan, gluten-free)
  - Image upload
- Set availability status
- Click "Save Menu Item"

### For Admins

Admins (platform_admin user type) can:
- View and manage ALL restaurants
- Edit any restaurant regardless of ownership
- Delete any restaurant
- Manage menu items for any restaurant
- Access vendor dashboard to see all restaurants in system

## Security Features

1. **Token-Based Authentication**: All API requests require valid auth token
2. **Server-Side Permission Checks**: Backend validates user permissions
3. **Client-Side Guards**: Frontend hides/shows UI based on user role
4. **Owner Verification**: Backend checks restaurant ownership before allowing modifications
5. **Admin Override**: Platform admins can manage all content

## Database Migration

Run this command to add the owner field to existing restaurants:
```bash
cd backend
python manage.py migrate
```

Note: Existing restaurants will have `owner=null`. You can manually assign owners via Django admin or programmatically.

## API Examples

### Create Restaurant
```bash
curl -X POST http://localhost:8000/api/restaurants/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -F "name=My Restaurant" \
  -F "description=Delicious food" \
  -F "cuisine_type=Italian" \
  -F "address=123 Main St" \
  -F "phone_number=+233245678901" \
  -F "email=restaurant@example.com" \
  -F "price_range=$$" \
  -F "image=@/path/to/image.jpg"
```

### Update Menu Item
```bash
curl -X PUT http://localhost:8000/api/menu-items/pasta-carbonara/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -F "name=Classic Carbonara" \
  -F "price=45.00" \
  -F "is_available=true"
```

### Delete Restaurant
```bash
curl -X DELETE http://localhost:8000/api/restaurants/my-restaurant-slug/ \
  -H "Authorization: Token YOUR_TOKEN"
```

## Testing Checklist

- [ ] Register as vendor user type
- [ ] Access vendor dashboard
- [ ] Create new restaurant
- [ ] Upload restaurant image
- [ ] Edit restaurant details
- [ ] Create menu item
- [ ] Edit menu item availability
- [ ] Delete menu item
- [ ] Delete restaurant
- [ ] Test as regular customer (no edit buttons visible)
- [ ] Test as admin (can edit all restaurants)

## Future Enhancements

1. **Bulk Operations**: Upload multiple menu items via CSV
2. **Image Gallery**: Multiple images per restaurant/menu item
3. **Analytics**: View stats (orders, revenue, popular items)
4. **Category Management**: Create custom menu categories
5. **Opening Hours Editor**: Visual schedule builder
6. **Clone Feature**: Duplicate menu items or restaurants
7. **Draft Mode**: Save unpublished changes
8. **Approval Workflow**: Admin approval for new restaurants
