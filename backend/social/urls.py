from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, DiningGroupViewSet, FollowViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'groups', DiningGroupViewSet, basename='group')
router.register(r'follow', FollowViewSet, basename='follow')

app_name = 'social'

urlpatterns = [
    path('', include(router.urls)),
]