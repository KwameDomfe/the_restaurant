from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import Restaurant, MenuCategory, MenuItem, RestaurantReview
from .serializers import (
    RestaurantListSerializer, RestaurantDetailSerializer,
    MenuCategorySerializer, MenuItemSerializer, RestaurantReviewSerializer,
    RestaurantSearchSerializer, RestaurantCreateSerializer
)

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Read permissions for everyone
    - Create permissions for vendors and admins
    - Edit/delete permissions only for owners or admins
    """
    def has_permission(self, request, view):
        # Allow read operations
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Create: allow vendors and admins
        if view.action == 'create':
            return request.user and request.user.is_authenticated and \
                   request.user.user_type in ['vendor', 'platform_admin']
        
        # For update/delete, check object permission
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow read operations
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow admins to edit anything
        if request.user.user_type == 'platform_admin':
            return True
        
        # Allow owners to edit their own restaurants
        return obj.owner == request.user

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.filter(is_active=True)
    lookup_field = 'slug'
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cuisine_type', 'price_range']
    search_fields = ['name', 'description', 'cuisine_type', 'address']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['-rating', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return RestaurantListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RestaurantCreateSerializer
        return RestaurantDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='my-restaurants')
    def my_restaurants(self, request):
        """Get restaurants owned by the current user"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        restaurants = Restaurant.objects.filter(owner=request.user)
        serializer = RestaurantListSerializer(restaurants, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def search(self, request):
        """Advanced restaurant search"""
        search_serializer = RestaurantSearchSerializer(data=request.data)
        if not search_serializer.is_valid():
            return Response(search_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        search_data = search_serializer.validated_data
        queryset = self.get_queryset()

        # Apply filters
        if search_data.get('query'):
            queryset = queryset.filter(
                Q(name__icontains=search_data['query']) |
                Q(description__icontains=search_data['query']) |
                Q(cuisine_type__icontains=search_data['query'])
            )

        if search_data.get('cuisine_type'):
            queryset = queryset.filter(cuisine_type__icontains=search_data['cuisine_type'])

        if search_data.get('price_range'):
            queryset = queryset.filter(price_range=search_data['price_range'])

        if search_data.get('min_rating'):
            queryset = queryset.filter(rating__gte=search_data['min_rating'])

        if search_data.get('features'):
            for feature in search_data['features']:
                queryset = queryset.filter(features__contains=[feature])

        # Apply ordering
        if search_data.get('ordering'):
            queryset = queryset.order_by(search_data['ordering'])

        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = RestaurantListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = RestaurantListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def menu(self, request, pk=None):
        """Get restaurant menu by categories"""
        restaurant = self.get_object()
        categories = restaurant.categories.prefetch_related('items').all()
        serializer = MenuCategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='popular-cuisines')
    def popular_cuisines(self, request):
        """Get popular cuisines based on restaurant count and ratings"""
        from django.db.models import Count, Avg
        
        # Get cuisine types with restaurant count and average rating
        cuisines = (
            Restaurant.objects
            .filter(is_active=True)
            .values('cuisine_type')
            .annotate(
                restaurant_count=Count('id'),
                avg_rating=Avg('rating')
            )
            .filter(restaurant_count__gt=0)
            .order_by('-restaurant_count', '-avg_rating')
        )
        
        # Format the response with emojis for popular cuisines
        cuisine_emojis = {
            'Italian': '🍝',
            'Japanese': '🍣', 
            'Mexican': '🌮',
            'Indian': '🍛',
            'Chinese': '🥢',
            'American': '🍔',
            'French': '🥐',
            'Thai': '🍜',
            'Mediterranean': '🫒',
            'Korean': '🍲',
            'Vietnamese': '🍲',
            'Greek': '🥗',
            'Spanish': '🥘',
            'Turkish': '🥙',
        }
        
        popular_cuisines = []
        for cuisine_data in cuisines:
            cuisine_type = cuisine_data['cuisine_type']
            popular_cuisines.append({
                'name': cuisine_type,
                
                'emoji': cuisine_emojis.get(cuisine_type, '🍽️'),
                'restaurant_count': cuisine_data['restaurant_count'],
                'avg_rating': round(cuisine_data['avg_rating'] or 0, 1)
            })
        
        return Response(popular_cuisines)

    @action(detail=True, methods=['get', 'post'])
    def reviews(self, request, pk=None):
        """Get or create restaurant reviews"""
        restaurant = self.get_object()
        
        if request.method == 'GET':
            reviews = restaurant.reviews.select_related('user').all()
            serializer = RestaurantReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = RestaurantReviewSerializer(
                data=request.data,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save(restaurant=restaurant)
                
                # Update restaurant rating
                avg_rating = restaurant.reviews.aggregate(Avg('rating'))['rating__avg']
                restaurant.rating = round(avg_rating, 2) if avg_rating else 0
                restaurant.save()
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IsRestaurantOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Permission for menu items and categories:
    - Read permissions for everyone
    - Create/edit/delete only for restaurant owners or admins
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.user_type == 'platform_admin':
            return True
        
        # Check if user owns the restaurant
        return obj.restaurant.owner == request.user

class MenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    permission_classes = [IsRestaurantOwnerOrAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant']

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.filter(is_available=True).order_by('id')
    serializer_class = MenuItemSerializer
    permission_classes = [IsRestaurantOwnerOrAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'category', 'is_vegetarian', 
        'is_vegan', 'is_gluten_free', 'spice_level'
    ]
    search_fields = ['name', 'description', 'ingredients']
    
    def get_queryset(self):
        """Show all items to owners/admins, only available items to others"""
        user = self.request.user
        if user.is_authenticated and user.user_type in ['vendor', 'platform_admin']:
            if self.action in ['list', 'retrieve']:
                # For listing, still filter by is_available unless they own the restaurant
                restaurant_id = self.request.query_params.get('restaurant')
                if restaurant_id:
                    try:
                        restaurant = Restaurant.objects.get(id=restaurant_id)
                        if restaurant.owner == user or user.user_type == 'platform_admin':
                            return MenuItem.objects.filter(restaurant=restaurant).order_by('id')
                    except Restaurant.DoesNotExist:
                        pass
        return MenuItem.objects.filter(is_available=True).order_by('id')

    @action(detail=False, methods=['get'], url_path='meal-periods')
    def by_meal_period(self, request):
        """Get menu items grouped by meal period"""
        # Get distinct meal periods from categories that have items
        categories = MenuCategory.objects.filter(
            items__is_available=True
        ).distinct().select_related('restaurant').prefetch_related('items')
        
        # Group items by meal period
        meal_periods_data = {
            'breakfast': [],
            'brunch': [],
            'lunch': [],
            'supper': [],
            'dinner': [],
            'all_day': []
        }
        
        for category in categories:
            meal_period = category.meal_period
            if meal_period in meal_periods_data:
                items = category.items.filter(is_available=True)
                serialized_items = MenuItemSerializer(
                    items, 
                    many=True, 
                    context={'request': request}
                ).data
                meal_periods_data[meal_period].extend(serialized_items)
        
        # Format response with display names and emojis
        response_data = []
        meal_period_info = {
            'breakfast': {
                'name': 'Breakfast', 
                'emoji': '🌅',
                'time': '7:00 AM - 11:00 AM'},
            'brunch': {
                'name': 'Brunch', 
                'emoji': '🥞',
                'time': '10:00 AM - 2:00 PM'
            },
            'lunch': {
                'name': 'Lunch', 
                'emoji': '🌤️',
                'time': '11:30 AM - 3:00 PM'
            },
            'supper': {
                'name': 'Supper', 
                'emoji': '🌆',
                'time': '5:00 PM - 7:00 PM'
            },
            'dinner': {
                'name': 'Dinner', 
                'emoji': '🌙',
                'time': '6:00 PM - 10:00 PM'
            },
            'all_day': {
                'name': 'All Day', 
                'emoji': '⭐',
                'time': 'Available All Day'
            }
        }
        
        for period_key, items in meal_periods_data.items():
            if items:  # Only include periods with available items
                info = meal_period_info[period_key]
                response_data.append({
                    'period': period_key,
                    'name': info['name'],
                    'emoji': info['emoji'],
                    'time': info['time'],
                    'items': items
                })
        
        return Response(response_data)

    @action(detail=False, methods=['get'])
    def dietary_filters(self, request):
        """Get menu items based on dietary preferences"""
        queryset = self.get_queryset()
        
        if request.query_params.get('vegetarian'):
            queryset = queryset.filter(is_vegetarian=True)
        if request.query_params.get('vegan'):
            queryset = queryset.filter(is_vegan=True)
        if request.query_params.get('gluten_free'):
            queryset = queryset.filter(is_gluten_free=True)
        
        max_spice = request.query_params.get('max_spice_level')
        if max_spice:
            queryset = queryset.filter(spice_level__lte=int(max_spice))

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class RestaurantReviewViewSet(viewsets.ModelViewSet):
    queryset = RestaurantReview.objects.select_related('user', 'restaurant')
    serializer_class = RestaurantReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['restaurant', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return self.queryset.filter(user=self.request.user)
        return self.queryset
