from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from test_views import test_api
from restaurants.views import RestaurantViewSet, MenuCategoryViewSet, MenuItemViewSet, RestaurantReviewViewSet

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'message': 'Welcome to The Restaurant API',
        'version': '1.0',
        'endpoints': {
            'restaurants': '/api/restaurants/',
            'orders': '/api/orders/',
            'accounts': '/api/accounts/',
            'social': '/api/social/',
            'auth': '/api/auth/',
            'docs': '/api/docs/',
            'test': '/api/test/'
        }
    })


router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')
router.register(r'categories', MenuCategoryViewSet, basename='menucategory')
router.register(r'reviews', RestaurantReviewViewSet, basename='restaurantreview')


urlpatterns = [

    path('', 
        api_root, 
        name='api-root'
    ),

    # Favicon to avoid 404 in browsers hitting backend root
    path('favicon.ico', 
        RedirectView.as_view(url='/static/favicon.ico', 
            permanent=True
        ),
    ),

    path('admin/', admin.site.urls),
    
    path('api/', 
        include(router.urls)
    ),

    path('api/test/', 
        test_api, 
        name='api-test'
    ),
    
    
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    path('api/accounts/', include('accounts.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/social/', include('social.urls')),

    # OpenAPI 3 documentation with Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
