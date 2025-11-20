from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestaurantViewSet, MenuCategoryViewSet, MenuItemViewSet, RestaurantReviewViewSet

app_name = 'restaurants'

urlpatterns = [
    path('', include(router.urls)),
]