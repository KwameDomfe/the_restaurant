 # Enhanced User Accounts System

## Overview

The user accounts system has been comprehensively enhanced to support multiple user types with specialized profiles and features. This multi-tenant system accommodates the diverse needs of different stakeholders in the restaurant platform ecosystem.

## User Types Supported

### 1. **Customer** (`customer`)
- **Purpose**: End users who order food from restaurants
- **Profile Features**:
  - Dietary preferences and allergens
  - Delivery addresses and payment methods
  - Order history and spending analytics
  - Loyalty points and membership tiers
  - Favorite restaurants and cuisines
  - Budget preferences and delivery time preferences

### 2. **Food Vendor/Restaurant Owner** (`vendor`)
- **Purpose**: Restaurant owners and food service providers
- **Profile Features**:
  - Business registration and legal documentation
  - Menu management and pricing controls
  - Operating hours and service areas
  - Financial settings (commission rates, payout schedules)
  - Performance metrics (sales, orders, preparation times)
  - Verification status and compliance tracking

### 3. **Delivery Service Provider** (`delivery`)
- **Purpose**: Drivers and delivery personnel
- **Profile Features**:
  - Vehicle information and equipment status
  - Driver's license and insurance documentation
  - Availability schedules and preferred zones
  - Performance tracking (success rate, delivery times)
  - Real-time location and online status
  - Earnings and delivery history

### 4. **Restaurant Staff** (`restaurant_staff`)
- **Purpose**: Restaurant employees (cooks, servers, cashiers)
- **Profile Features**:
  - Employee ID and position details
  - Work schedules and shift patterns
  - System permissions and access levels
  - Performance ratings and training records
  - Department assignments

### 5. **Restaurant Manager** (`restaurant_manager`)
- **Purpose**: Restaurant management personnel
- **Enhanced Features**:
  - Staff management capabilities
  - Menu modification permissions
  - Order processing oversight
  - Financial access controls

### 6. **Restaurant Owner** (`restaurant_owner`)
- **Purpose**: Restaurant owners with full access
- **Enhanced Features**:
  - Complete restaurant control
  - Staff hiring and management
  - Financial reporting access
  - Business analytics

### 7. **Platform Administrator** (`platform_admin`)
- **Purpose**: System administrators
- **Enhanced Features**:
  - User verification and approval
  - System-wide access and controls
  - Analytics and reporting
  - Content moderation

### 8. **Customer Support Agent** (`support_agent`)
- **Purpose**: Customer service representatives
- **Enhanced Features**:
  - User account access for support
  - Order issue resolution
  - Communication tools

### 9. **Content Moderator** (`content_moderator`)
- **Purpose**: Content review and moderation
- **Enhanced Features**:
  - Review management
  - Content approval workflows
  - User behavior monitoring

### 10. **Marketing Specialist** (`marketing_specialist`)
- **Purpose**: Marketing and promotional activities
- **Enhanced Features**:
  - Campaign management
  - User engagement analytics
  - Promotional content creation

### 11. **Finance Manager** (`finance_manager`)
- **Purpose**: Financial operations and reporting
- **Enhanced Features**:
  - Financial reporting access
  - Payment processing oversight
  - Commission and payout management

### 12. **Data Analyst** (`data_analyst`)
- **Purpose**: Data analysis and business intelligence
- **Enhanced Features**:
  - Analytics dashboard access
  - Data export capabilities
  - Performance metrics analysis

## Enhanced Features

### **Multi-Profile Architecture**
- **Base Profile**: Common information for all users (bio, location, preferences)
- **Type-Specific Profiles**: Specialized data based on user type
- **Verification System**: Document verification and background checks
- **Dynamic Permissions**: Role-based access control

### **Verification System**
- **Identity Verification**: Document validation for all user types
- **Business Verification**: License and registration verification for vendors
- **Background Checks**: Required for delivery drivers and staff
- **Financial Verification**: Bank account and payment method validation

### **Security Features**
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **Account Status Management**: Active, pending, suspended, inactive, banned
- **IP Tracking**: Last login IP address tracking
- **Email/Phone Verification**: Multi-step verification process

### **Business Features**
- **Commission Management**: Configurable commission rates for vendors
- **Financial Tracking**: Earnings, sales, and payout management
- **Performance Metrics**: Success rates, delivery times, ratings
- **Operational Controls**: Hours, availability, service areas

## Database Models

### **CustomUser (Enhanced)**
- Core user information with type-specific fields
- Verification status tracking
- Security and authentication features
- Business and employment information

### **UserProfile**
- Extended profile information
- Social media and emergency contacts
- Professional details and certifications
- Privacy and notification preferences

### **CustomerProfile**
- Order history and spending analytics
- Membership tiers and benefits
- Favorite restaurants and preferences
- Delivery and payment preferences

### **VendorProfile**
- Business registration and documentation
- Operational details and settings
- Financial configuration
- Performance metrics and verification

### **DeliveryProfile**
- Vehicle and equipment information
- Documentation and certification
- Availability and performance tracking
- Real-time status management

### **StaffProfile**
- Employment details and permissions
- Work schedules and training records
- Performance evaluations
- Role-specific access controls

### **UserVerification**
- Document verification status
- Background check results
- Business license validation
- Overall verification tracking

## API Integration

### **Enhanced Serializers**
- Type-specific serialization for different user profiles
- Public vs. private data separation
- Computed property inclusion (success rates, permissions)
- Nested profile data handling

### **Registration System**
- User type selection during registration
- Automatic profile creation based on type
- Validation and verification workflows
- Welcome flows for different user types

### **Profile Management**
- Type-specific profile update endpoints
- Document upload and verification
- Status and permission management
- Performance tracking updates

## Admin Interface

### **Enhanced Admin Views**
- Type-specific filtering and search
- Verification status management
- Performance metric display
- Role-based field access

### **User Management Tools**
- Bulk operations for user types
- Verification workflow management
- Status change tracking
- Communication tools

## Migration Support

### **Data Migration Command**
- Automatic profile creation for existing users
- Type assignment and verification setup
- Bulk migration capabilities
- Rollback and validation features

### **Backward Compatibility**
- Existing user data preservation
- Gradual migration approach
- Default type assignment
- Profile auto-creation

## Usage Examples

### **Creating Different User Types**

```python
# Customer Registration
customer = CustomUser.objects.create(
    username='john_customer',
    email='john@example.com',
    user_type='customer',
    first_name='John',
    last_name='Doe'
)

# Vendor Registration
vendor = CustomUser.objects.create(
    username='pizza_palace',
    email='owner@pizzapalace.com',
    user_type='vendor',
    business_license='BL123456'
)

# Delivery Driver Registration
driver = CustomUser.objects.create(
    username='fast_driver',
    email='driver@example.com',
    user_type='delivery',
    vehicle_type='motorcycle',
    license_plate='ABC123'
)
```

### **User Type Checking**

```python
# Check user capabilities
if user.can_manage_restaurants:
    # Allow restaurant management
    pass

if user.can_deliver_orders:
    # Show delivery interface
    pass

if user.is_customer:
    # Show customer features
    pass
```

### **Profile Access**

```python
# Access type-specific profiles
if user.user_type == 'customer':
    loyalty_points = user.customer_profile.loyalty_points
    membership = user.customer_profile.membership_tier

elif user.user_type == 'vendor':
    business_name = user.vendor_profile.business_name
    total_sales = user.vendor_profile.total_sales

elif user.user_type == 'delivery':
    success_rate = user.delivery_profile.success_rate
    is_online = user.delivery_profile.is_online
```

## Benefits

1. **Scalability**: Supports unlimited user types and roles
2. **Security**: Role-based access control and verification
3. **Flexibility**: Extensible profile system for future needs
4. **Performance**: Optimized queries with proper indexing
5. **Maintainability**: Clean separation of concerns
6. **User Experience**: Tailored interfaces for each user type
7. **Compliance**: Built-in verification and documentation tracking
8. **Analytics**: Rich data model for business intelligence

This enhanced user accounts system provides a robust foundation for a comprehensive multi-stakeholder restaurant platform, supporting the diverse needs of customers, vendors, delivery providers, staff, and administrators while maintaining security, scalability, and user experience.