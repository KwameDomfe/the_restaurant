from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    UserProfile, CustomerProfile, VendorProfile, 
    DeliveryProfile, StaffProfile, UserVerification
)

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'bio', 'location', 'favorite_cuisines', 'allergens', 'spice_tolerance',
            'social_media_links', 'emergency_contact', 'privacy_settings',
            'notification_preferences', 'marketing_opt_in', 'professional_summary',
            'certifications', 'languages_spoken', 'availability_hours',
            'average_rating', 'total_ratings'
        ]

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = [
            'preferred_delivery_time', 'budget_range', 'total_orders', 'total_spent',
            'favorite_restaurants', 'membership_tier', 'membership_expires'
        ]
        read_only_fields = ['total_orders', 'total_spent']

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = [
            'business_name', 'business_type', 'business_description',
            'business_registration_number', 'food_safety_certification',
            'insurance_policy_number', 'cuisine_specialties', 'service_areas',
            'operating_hours', 'minimum_order_amount', 'commission_rate',
            'payout_schedule', 'total_sales', 'total_orders',
            'average_preparation_time', 'verification_status'
        ]
        read_only_fields = ['total_sales', 'total_orders', 'average_preparation_time', 'verification_status']

class DeliveryProfileSerializer(serializers.ModelSerializer):
    success_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = DeliveryProfile
        fields = [
            'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_color',
            'has_insulated_bag', 'has_gps_device', 'drivers_license_number',
            'insurance_policy', 'vehicle_registration', 'available_hours',
            'preferred_zones', 'max_deliveries_per_hour', 'total_deliveries',
            'successful_deliveries', 'success_rate', 'average_delivery_time',
            'total_earnings', 'is_online', 'current_location'
        ]
        read_only_fields = [
            'total_deliveries', 'successful_deliveries', 'average_delivery_time',
            'total_earnings', 'success_rate'
        ]

class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = [
            'employee_id', 'position', 'department', 'shift_pattern',
            'work_schedule', 'permissions', 'can_process_orders',
            'can_handle_payments', 'can_modify_menu', 'can_manage_staff',
            'performance_rating', 'training_completed'
        ]
        read_only_fields = ['employee_id', 'performance_rating']

class UserVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserVerification
        fields = [
            'identity_document_type', 'identity_document_verified',
            'business_license_verified', 'tax_id_verified', 'food_safety_verified',
            'background_check_status', 'bank_account_verified',
            'payment_method_verified', 'fully_verified', 'verification_notes'
        ]
        read_only_fields = [
            'identity_document_verified', 'business_license_verified',
            'tax_id_verified', 'food_safety_verified', 'background_check_status',
            'bank_account_verified', 'payment_method_verified', 'fully_verified'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    customer_profile = CustomerProfileSerializer(read_only=True)
    vendor_profile = VendorProfileSerializer(read_only=True)
    delivery_profile = DeliveryProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
    verification = UserVerificationSerializer(read_only=True)
    
    # Computed properties
    is_customer = serializers.ReadOnlyField()
    is_vendor = serializers.ReadOnlyField()
    is_delivery_provider = serializers.ReadOnlyField()
    is_restaurant_staff = serializers.ReadOnlyField()
    is_platform_admin = serializers.ReadOnlyField()
    can_manage_restaurants = serializers.ReadOnlyField()
    can_deliver_orders = serializers.ReadOnlyField()
    
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'profile_picture',
            'user_type', 'account_status', 'dietary_preferences',
            'loyalty_points', 'preferred_payment_methods', 'delivery_addresses',
            'email_verified', 'phone_verified', 'identity_verified',
            'background_check_passed', 'two_factor_enabled',
            'date_joined', 'last_login', 'created_at', 'updated_at',
            'profile', 'customer_profile', 'vendor_profile',
            'delivery_profile', 'staff_profile', 'verification',
            'is_customer', 'is_vendor', 'is_delivery_provider',
            'is_restaurant_staff', 'is_platform_admin',
            'can_manage_restaurants', 'can_deliver_orders',
            'password'
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login', 'created_at', 'updated_at',
            'email_verified', 'phone_verified', 'identity_verified',
            'background_check_passed', 'loyalty_points'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class PublicUserSerializer(serializers.ModelSerializer):
    """Serializer for public user information (used in social features)"""
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture', 'user_type', 'profile']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Simplified serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'phone_number', 'user_type', 'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile information"""
    profile = UserProfileSerializer()
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'date_of_birth',
            'profile_picture', 'dietary_preferences', 'preferred_payment_methods',
            'delivery_addresses', 'profile'
        ]
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance

class UserStatsSerializer(serializers.ModelSerializer):
    total_orders = serializers.SerializerMethodField()
    favorite_restaurants_count = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'user_type', 'loyalty_points', 'total_orders', 'favorite_restaurants_count', 'reviews_count']
    
    def get_total_orders(self, obj):
        if hasattr(obj, 'customer_profile'):
            return obj.customer_profile.total_orders
        return getattr(obj, 'orders', obj).count() if hasattr(obj, 'orders') else 0
    
    def get_favorite_restaurants_count(self, obj):
        if hasattr(obj, 'customer_profile'):
            return len(obj.customer_profile.favorite_restaurants)
        return getattr(obj, 'favorites', obj).filter(restaurant__isnull=False).count() if hasattr(obj, 'favorites') else 0
    
    def get_reviews_count(self, obj):
        return getattr(obj, 'restaurantreview_set', obj).count() if hasattr(obj, 'restaurantreview_set') else 0