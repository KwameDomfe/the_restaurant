from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import Restaurant, MenuCategory, MenuItem, RestaurantReview
from .serializers import (
    RestaurantListSerializer, RestaurantDetailSerializer,
    MenuCategorySerializer, MenuItemSerializer, RestaurantReviewSerializer,
    RestaurantSearchSerializer
)

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cuisine_type', 'price_range']
    search_fields = ['name', 'description', 'cuisine_type', 'address']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['-rating', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return RestaurantListSerializer
        return RestaurantDetailSerializer

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

class MenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant']

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.filter(is_available=True)
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        'restaurant', 'category', 'is_vegetarian', 
        'is_vegan', 'is_gluten_free', 'spice_level'
    ]
    search_fields = ['name', 'description', 'ingredients']

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
