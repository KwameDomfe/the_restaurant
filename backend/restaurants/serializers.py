
from rest_framework import serializers
from .models import Restaurant, MenuCategory, MenuItem, RestaurantReview
from django.contrib.auth import get_user_model

class RestaurantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            'name', 'description', 'cuisine_type', 'address',
            'phone_number', 'email', 'website', 'image', 'price_range',
            'opening_hours', 'features', 'is_active',
            'delivery_fee', 'delivery_time', 'min_order'
        ]
        read_only_fields = []

User = get_user_model()

class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    restaurant_name = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            'id', 'slug', 'restaurant', 'name', 'description', 'price', 'image', 'ingredients',
            'allergens', 'nutritional_info', 'is_available', 'is_vegetarian',
            'is_vegan', 'is_gluten_free', 'spice_level', 'prep_time',
            'restaurant_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image(self, obj):
        """Return uploaded image if available, otherwise food-type specific placeholder"""
        # First check if there's an uploaded image
        if obj.image and hasattr(obj.image, 'url'):
            try:
                return self.context['request'].build_absolute_uri(obj.image.url)
            except:
                pass  # If there's an error building the URL, fall back to placeholder
        
        # Food-type specific placeholder images based on item name/ingredients
        item_name = obj.name.lower()
        
        if 'pasta' in item_name or 'spaghetti' in item_name or 'penne' in item_name:
            return 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop'
        elif 'sushi' in item_name or 'roll' in item_name:
            return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop'
        elif 'bowl' in item_name or 'buddha' in item_name:
            return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'
        elif 'smoothie' in item_name or 'juice' in item_name or 'machine' in item_name or 'blast' in item_name:
            return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=200&fit=crop'
        elif 'bruschetta' in item_name or 'calamari' in item_name:
            return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
        else:
            return 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop'

    def get_restaurant_name(self, obj):
        """Return the restaurant name this menu item belongs to"""
        return obj.restaurant.name if obj.restaurant else None

class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'meal_period', 'display_order', 'items', 'items_count', 'image']
        read_only_fields = ['id']

    def get_items_count(self, obj):
        return obj.items.filter(is_available=True).count()

    def get_image(self, obj):
        # If MenuCategory has an image field, return its URL, else fallback to a placeholder
        if hasattr(obj, 'image') and obj.image and hasattr(obj.image, 'url'):
            try:
                return self.context['request'].build_absolute_uri(obj.image.url)
            except:
                pass
        # Fallback placeholder image for category
        return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop'

class RestaurantListSerializer(serializers.ModelSerializer):
    """Simplified serializer for restaurant listings"""
    categories_count = serializers.SerializerMethodField()
    menu_items_count = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'slug', 'name', 'description', 'cuisine_type', 'address',
            'phone_number', 'email', 'website', 'image', 'rating', 'price_range',
            'delivery_fee', 'delivery_time', 'min_order',
            'categories_count', 'menu_items_count', 'reviews_count',
            'is_active', 'features', 'opening_hours'
        ]

    def get_image(self, obj):
        """Return uploaded image if available, otherwise cuisine-specific placeholder"""
        # First check if there's an uploaded image
        if obj.image and hasattr(obj.image, 'url'):
            try:
                return self.context['request'].build_absolute_uri(obj.image.url)
            except:
                pass  # If there's an error building the URL, fall back to placeholder
        
        # Cuisine-specific placeholder images as fallback
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
        
        return cuisine_images.get(
            obj.cuisine_type, 
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center'
        )

    def get_categories_count(self, obj):
        return obj.categories.count()

    def get_menu_items_count(self, obj):
        return obj.menu_items.filter(is_available=True).count()

    def get_reviews_count(self, obj):
        return obj.reviews.count()

class RestaurantDetailSerializer(serializers.ModelSerializer):
    categories = MenuCategorySerializer(many=True, read_only=True)
    recent_reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'slug', 'name', 'description', 'cuisine_type', 'address',
            'phone_number', 'email', 'website', 'image', 'rating',
            'price_range', 'opening_hours', 'features', 'is_active',
            'delivery_fee', 'delivery_time', 'min_order',
            'categories', 'recent_reviews', 'average_rating', 'total_reviews',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'created_at', 'updated_at']

    def get_image(self, obj):
        """Return uploaded image if available, otherwise cuisine-specific placeholder"""
        # First check if there's an uploaded image
        if obj.image and hasattr(obj.image, 'url'):
            try:
                return self.context['request'].build_absolute_uri(obj.image.url)
            except:
                pass  # If there's an error building the URL, fall back to placeholder
        
        # Cuisine-specific placeholder images as fallback
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
        
        return cuisine_images.get(
            obj.cuisine_type, 
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center'
        )

    def get_recent_reviews(self, obj):
        recent_reviews = obj.reviews.select_related('user')[:5]
        return RestaurantReviewSerializer(recent_reviews, many=True).data

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(review.rating for review in reviews) / len(reviews)
        return 0.0

    def get_total_reviews(self, obj):
        return obj.reviews.count()

class RestaurantReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = RestaurantReview
        fields = [
            'id', 'user', 'user_name', 'rating', 'comment', 'images',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class RestaurantSearchSerializer(serializers.Serializer):
    """Serializer for restaurant search parameters"""
    query = serializers.CharField(required=False, allow_blank=True)
    cuisine_type = serializers.CharField(required=False, allow_blank=True)
    price_range = serializers.CharField(required=False, allow_blank=True)
    min_rating = serializers.FloatField(required=False, min_value=0, max_value=5)
    features = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    ordering = serializers.ChoiceField(
        choices=['rating', '-rating', 'name', '-name', 'price_range', '-price_range'],
        required=False
    )