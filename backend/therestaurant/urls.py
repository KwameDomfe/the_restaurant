"""
URL configuration for therestaurant project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
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

from restaurants.views import RestaurantViewSet, MenuCategoryViewSet, MenuItemViewSet, RestaurantReviewViewSet

schema_view = get_schema_view(
   openapi.Info(
      title="The Restaurant API",
      default_version='v1',
      description="Restaurant app API documentation",
      contact=openapi.Contact(email="contact@therestaurant.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')
router.register(r'categories', MenuCategoryViewSet, basename='menucategory')
router.register(r'reviews', RestaurantReviewViewSet, basename='restaurantreview')


urlpatterns = [
    path('', api_root, name='api-root'),
    # Favicon to avoid 404 in browsers hitting backend root
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico', permanent=True)),
    path('api/', include(router.urls)),
    path('api/test/', test_api, name='api-test'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    path('api/accounts/', include('accounts.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/social/', include('social.urls')),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
