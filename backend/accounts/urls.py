from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, UserProfileViewSet, CustomAuthToken,
    register_user, logout_user, check_username_availability,
    check_email_availability, request_password_reset,
    verify_email, get_user_types
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)

app_name = 'accounts'

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', CustomAuthToken.as_view(), name='login'),
    path('auth/register/', register_user, name='register'),
    path('auth/logout/', logout_user, name='logout'),
    
    # User validation endpoints
    path('auth/check-username/', check_username_availability, name='check_username'),
    path('auth/check-email/', check_email_availability, name='check_email'),
    
    # Password management
    path('auth/request-password-reset/', request_password_reset, name='request_password_reset'),
    
    # Email verification
    path('auth/verify-email/', verify_email, name='verify_email'),
    
    # User types
    path('auth/user-types/', get_user_types, name='user_types'),
]