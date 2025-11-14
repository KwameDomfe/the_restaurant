from accounts.models import CustomUser
CustomUser.objects.create_superuser(
  'admin', 
  'admin@restaurant.com', 
  'admin123'
)