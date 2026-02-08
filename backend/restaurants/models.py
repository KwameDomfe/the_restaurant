from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

class Restaurant(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_restaurants', limit_choices_to={'user_type__in': ['vendor', 'platform_admin']}, null=True, blank=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    cuisine_type = models.CharField(max_length=100)
    address = models.TextField()
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    website = models.URLField(blank=True)
    image = models.ImageField(upload_to='restaurants/', blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    price_range = models.CharField(max_length=20, choices=[
        ('$', 'Budget'),
        ('$$', 'Moderate'),
        ('$$$', 'Expensive'),
        ('$$$$', 'Fine Dining')
    ])
    opening_hours = models.JSONField(default=dict)
    features = models.JSONField(default=list)  # ['wifi', 'parking', 'delivery']
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=2.99, help_text="Delivery fee in GHC")
    delivery_time = models.CharField(max_length=50, default="30-45 min", help_text="Estimated delivery time")
    min_order = models.DecimalField(max_digits=8, decimal_places=2, default=15.00, help_text="Minimum order amount in GHC")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            raw_base = slugify(self.name) or "restaurant"
            # Ensure base length leaves room for numeric suffixes
            base = raw_base[:240]
            candidate = base
            i = 1
            while Restaurant.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                i += 1
                suffix = f"-{i}"
                candidate = f"{base[:240-len(suffix)]}{suffix}"
            self.slug = candidate
        super().save(*args, **kwargs)

class MenuCategory(models.Model):
    MEAL_PERIOD_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('brunch', 'Brunch'),
        ('lunch', 'Lunch'),
        ('supper', 'Supper'),
        ('dinner', 'Dinner'),
        ('all_day', 'All Day'),
    ]
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='menu_categories/', blank=True)
    meal_period = models.CharField(max_length=20, choices=MEAL_PERIOD_CHOICES, default='all_day')
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order']
        verbose_name_plural = 'Menu Categories'

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', blank=True)
    # ingredients: list of objects {name, quantity, unit, notes}
    ingredients = models.JSONField(default=list, help_text="List of ingredients as objects: [{name, quantity, unit, notes}]")
    allergens = models.JSONField(default=list)
    nutritional_info = models.JSONField(default=dict)
    is_available = models.BooleanField(default=True)
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    spice_level = models.IntegerField(default=0, choices=[(i, i) for i in range(6)])
    prep_time = models.IntegerField(help_text="Preparation time in minutes", null=True, blank=True, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            base_parts = []
            if self.restaurant_id and hasattr(self, 'restaurant') and self.restaurant and self.restaurant.name:
                base_parts.append(self.restaurant.name)
            base_parts.append(self.name)
            raw_base = slugify("-".join(base_parts)) or "menu-item"
            base = raw_base[:240]
            candidate = base
            i = 1
            while MenuItem.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                i += 1
                suffix = f"-{i}"
                candidate = f"{base[:240-len(suffix)]}{suffix}"
            self.slug = candidate
        super().save(*args, **kwargs)

class RestaurantReview(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    images = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['restaurant', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.restaurant.name} ({self.rating}/5)"
