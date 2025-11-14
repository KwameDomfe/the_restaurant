from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestaurantViewSet, MenuCategoryViewSet, MenuItemViewSet, RestaurantReviewViewSet

router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet)
router.register(r'categories', MenuCategoryViewSet)
router.register(r'menu-items', MenuItemViewSet)
router.register(r'reviews', RestaurantReviewViewSet)

app_name = 'restaurants'

urlpatterns = [
    path('', include(router.urls)),
]