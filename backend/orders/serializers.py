from rest_framework import serializers
from .models import Order, OrderItem, OrderTracking, Cart, CartItem
from restaurants.serializers import MenuItemSerializer, RestaurantListSerializer
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'menu_item', 'menu_item_id', 'quantity', 'unit_price',
            'total_price', 'special_instructions', 'customizations'
        ]
        read_only_fields = ['id', 'total_price']

class OrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTracking
        fields = ['id', 'status', 'message', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class OrderListSerializer(serializers.ModelSerializer):
    restaurant = RestaurantListSerializer(read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'restaurant', 'status', 'total_amount',
            'items_count', 'estimated_delivery_time', 'created_at'
        ]

    def get_items_count(self, obj):
        return obj.items.count()

class OrderDetailSerializer(serializers.ModelSerializer):
    restaurant = RestaurantListSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    tracking = OrderTrackingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'restaurant', 'status', 'total_amount',
            'delivery_fee', 'tax_amount', 'tip_amount', 'delivery_address',
            'delivery_instructions', 'estimated_delivery_time', 
            'actual_delivery_time', 'payment_method', 'payment_status',
            'notes', 'items', 'tracking', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'created_at', 'updated_at'
        ]

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, write_only=True)
    restaurant_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = [
            'restaurant_id', 'delivery_address', 'delivery_instructions',
            'payment_method', 'notes', 'items', 'tip_amount'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        restaurant_id = validated_data.pop('restaurant_id')
        
        # Generate order number
        validated_data['order_number'] = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        validated_data['user'] = self.context['request'].user
        validated_data['restaurant_id'] = restaurant_id
        
        # Calculate totals
        subtotal = 0
        for item_data in items_data:
            from restaurants.models import MenuItem
            menu_item = MenuItem.objects.get(id=item_data['menu_item_id'])
            item_data['unit_price'] = menu_item.price
            item_data['total_price'] = item_data['quantity'] * menu_item.price
            subtotal += item_data['total_price']
        
        # Add delivery fee and tax (simplified calculation)
        validated_data['delivery_fee'] = 5.00  # Fixed delivery fee
        validated_data['tax_amount'] = subtotal * 0.08  # 8% tax
        validated_data['total_amount'] = (
            subtotal + 
            validated_data['delivery_fee'] + 
            validated_data['tax_amount'] + 
            validated_data.get('tip_amount', 0)
        )
        
        order = Order.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        # Create initial tracking entry
        OrderTracking.objects.create(
            order=order,
            status='pending',
            message='Order received and being processed'
        )
        
        return order

class CartItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)
    item_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'menu_item', 'menu_item_id', 'quantity', 
            'customizations', 'item_total', 'added_at'
        ]
        read_only_fields = ['id', 'added_at']

    def get_item_total(self, obj):
        return obj.quantity * obj.menu_item.price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    restaurant = RestaurantListSerializer(read_only=True)
    total_items = serializers.SerializerMethodField()
    cart_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id', 'restaurant', 'items', 'total_items', 
            'cart_total', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_cart_total(self, obj):
        return sum(item.quantity * item.menu_item.price for item in obj.items.all())

class AddToCartSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    customizations = serializers.JSONField(required=False, default=dict)

class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)  # 0 means remove item
    customizations = serializers.JSONField(required=False)