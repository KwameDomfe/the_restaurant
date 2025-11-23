from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.core.files.storage import default_storage
from django.conf import settings
from uuid import uuid4
import os
import re
from .models import Restaurant, MenuCategory, MenuItem, RestaurantReview

# Custom widget to support multiple file uploads in Django admin forms
class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class RestaurantReviewAdminForm(forms.ModelForm):
    """Custom form for RestaurantReview to handle image uploads."""
    
    # Use a FileField to allow multiple image uploads
    image_uploads = forms.FileField(
        widget=MultipleFileInput(),
        required=False,
        help_text="Upload one or more images for the review."
    )

    replace_images = forms.BooleanField(
        required=False,
        initial=False,
        help_text="If checked, uploaded files will replace existing images. If unchecked, they will be appended."
    )

    class Meta:
        model = RestaurantReview
        fields = '__all__'
        widgets = {
            'comment': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Hide the raw JSON field only if it exists on this form
        if 'images' in self.fields:
            self.fields['images'].widget = forms.HiddenInput()

    def clean_image_uploads(self):
        """Return a list of uploaded files without invoking FileField's default single-file validation."""
        files = self.files.getlist('image_uploads')
        if not files:
            return []

        allowed_ext = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        max_size = 10 * 1024 * 1024  # 10MB per file

        for f in files:
            ext = os.path.splitext(f.name)[1].lower()
            if ext not in allowed_ext:
                raise forms.ValidationError(f"Unsupported file type for '{f.name}'. Allowed: {', '.join(sorted(allowed_ext))}.")
            if getattr(f, 'size', 0) > max_size:
                raise forms.ValidationError(f"'{f.name}' exceeds the 10MB size limit.")

        return files

    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Handle uploaded files: save to storage and store URLs in JSON
        uploaded_files = self.cleaned_data.get('image_uploads') or []
        # Either replace existing images or append to them
        image_urls = [] if self.cleaned_data.get('replace_images') else list(instance.images or [])

        for f in uploaded_files:
            base, ext = os.path.splitext(f.name)
            filename = f"{uuid4().hex}{ext}"
            storage_path = default_storage.save(os.path.join('reviews', filename), f)
            # Try to get absolute URL from storage; fallback to MEDIA_URL
            try:
                url = default_storage.url(storage_path)
            except Exception:
                url = (settings.MEDIA_URL.rstrip('/') + '/' + storage_path.replace('\\', '/').lstrip('/'))
            image_urls.append(url)

        instance.images = image_urls
        
        if commit:
            instance.save()
        return instance

class AllergenWidget(forms.CheckboxSelectMultiple):
    """Custom widget for allergen selection"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.choices = [
            ('dairy', 'Dairy'),
            ('eggs', 'Eggs'), 
            ('fish', 'Fish'),
            ('shellfish', 'Shellfish'),
            ('tree_nuts', 'Tree Nuts'),
            ('peanuts', 'Peanuts'),
            ('wheat', 'Wheat'),
            ('soy', 'Soy'),
            ('sesame', 'Sesame'),
            ('sulphites', 'Sulphites'),
            ('mustard', 'Mustard'),
            ('celery', 'Celery'),
            ('lupin', 'Lupin'),
            ('molluscs', 'Molluscs'),
        ]

class MenuItemAdminForm(forms.ModelForm):
    """Custom form for MenuItem with improved allergen and nutritional info fields"""
    
    allergens = forms.MultipleChoiceField(
        choices=[
            ('dairy', '🥛 Dairy'),
            ('eggs', '🥚 Eggs'), 
            ('fish', '🐟 Fish'),
            ('shellfish', '🦐 Shellfish'),
            ('tree_nuts', '🌰 Tree Nuts'),
            ('peanuts', '🥜 Peanuts'),
            ('wheat', '🌾 Wheat'),
            ('soy', '🫘 Soy'),
            ('sesame', '🌱 Sesame'),
            ('sulphites', '⚡ Sulphites'),
            ('mustard', '🌭 Mustard'),
            ('celery', '🥬 Celery'),
            ('lupin', '🌿 Lupin'),
            ('molluscs', '🐚 Molluscs'),
        ],
        widget=forms.CheckboxSelectMultiple,
        required=False,
        help_text="Select all allergens present in this item"
    )
    
    ingredients = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3, 'placeholder': 'Enter ingredients separated by commas (e.g., tomatoes, basil, mozzarella)'}),
        required=False,
        help_text="List all ingredients separated by commas"
    )
    
    # Individual nutrition fields instead of complex widget
    calories = forms.FloatField(required=False, min_value=0, help_text="Calories per serving (kcal)")
    protein = forms.FloatField(required=False, min_value=0, help_text="Protein content (g)")
    carbohydrates = forms.FloatField(required=False, min_value=0, help_text="Carbohydrates (g)")
    fat = forms.FloatField(required=False, min_value=0, help_text="Total fat content (g)")
    fiber = forms.FloatField(required=False, min_value=0, help_text="Fiber content (g)")
    sodium = forms.FloatField(required=False, min_value=0, help_text="Sodium content (mg)")
    sugar = forms.FloatField(required=False, min_value=0, help_text="Sugar content (g)")
    
    class Meta:
        model = MenuItem
        exclude = ['nutritional_info']  # Exclude the JSONField since we handle it with individual fields
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Convert JSON allergens to form field format
        if self.instance and self.instance.pk:
            if self.instance.allergens:
                self.fields['allergens'].initial = self.instance.allergens
            
            # Convert ingredients from JSON list to comma-separated string
            if self.instance.ingredients:
                self.fields['ingredients'].initial = ', '.join(self.instance.ingredients)
            
            # Extract nutritional info to individual fields
            if self.instance.nutritional_info:
                nutrition = self.instance.nutritional_info
                self.fields['calories'].initial = nutrition.get('calories')
                self.fields['protein'].initial = nutrition.get('protein')
                self.fields['carbohydrates'].initial = nutrition.get('carbohydrates')
                self.fields['fat'].initial = nutrition.get('fat')
                self.fields['fiber'].initial = nutrition.get('fiber')
                self.fields['sodium'].initial = nutrition.get('sodium')
                self.fields['sugar'].initial = nutrition.get('sugar')
    
    def clean_allergens(self):
        """Convert allergens back to JSON format"""
        allergens = self.cleaned_data.get('allergens', [])
        return allergens
        
    def clean_ingredients(self):
        """Convert comma-separated string back to a list of strings"""
        ingredients_str = self.cleaned_data.get('ingredients', '')
        if not ingredients_str:
            return []
        return [item.strip() for item in ingredients_str.split(',') if item.strip()]

    def save(self, commit=True):
        """Override save to handle custom fields"""
        instance = super().save(commit=False)
        
        # Reconstruct nutritional_info JSON
        instance.nutritional_info = {
            'calories': self.cleaned_data.get('calories'),
            'protein': self.cleaned_data.get('protein'),
            'carbohydrates': self.cleaned_data.get('carbohydrates'),
            'fat': self.cleaned_data.get('fat'),
            'fiber': self.cleaned_data.get('fiber'),
            'sodium': self.cleaned_data.get('sodium'),
            'sugar': self.cleaned_data.get('sugar'),
        }
        
        # The 'allergens' and 'ingredients' fields are handled by their clean methods
        instance.allergens = self.cleaned_data.get('allergens', [])
        instance.ingredients = self.cleaned_data.get('ingredients', [])
        
        if commit:
            instance.save()
        return instance

class MenuCategoryInline(admin.TabularInline):
    """Inline editor for Menu Categories within a Restaurant"""
    model = MenuCategory
    extra = 1
    ordering = ['display_order']
    fields = ['name', 'description', 'meal_period', 'display_order']

class MenuItemInline(admin.TabularInline):
    """Inline editor for Menu Items within a Restaurant"""
    model = MenuItem
    form = MenuItemAdminForm
    extra = 1
    ordering = ['category', 'name']
    fields = ['name', 'category', 'price', 'is_available']
    readonly_fields = ['slug']

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    """Admin configuration for the Restaurant model"""
    list_display = ('name', 'cuisine_type', 'rating', 'price_range', 'is_active', 'created_at')
    list_filter = ('cuisine_type', 'price_range', 'is_active')
    search_fields = ('name', 'description', 'cuisine_type')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [MenuCategoryInline, MenuItemInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'image')
        }),
        ('Details', {
            'fields': ('cuisine_type', 'price_range', 'rating', 'address', 'phone_number', 'email', 'website')
        }),
        ('Operations', {
            'fields': ('opening_hours', 'features', 'delivery_fee', 'delivery_time', 'min_order', 'is_active')
        }),
    )

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    """Admin configuration for MenuCategory"""
    list_display = ('name', 'restaurant', 'meal_period', 'display_order')
    list_filter = ('restaurant', 'meal_period')
    search_fields = ('name', 'restaurant__name')
    ordering = ('restaurant', 'display_order')

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    """Admin configuration for MenuItem"""
    form = MenuItemAdminForm
    list_display = ('name', 'restaurant', 'category', 'price', 'is_available', 'spice_level')
    list_filter = ('restaurant', 'category', 'is_available', 'is_vegetarian', 'is_vegan', 'is_gluten_free')
    search_fields = ('name', 'description', 'restaurant__name')
    ordering = ('restaurant', 'category', 'name')
    readonly_fields = ('slug',)
    
    fieldsets = (
        (None, {
            'fields': ('restaurant', 'category', 'name', 'slug', 'description', 'price', 'image')
        }),
        ('Dietary Information', {
            'classes': ('collapse',),
            'fields': ('is_available', 'is_vegetarian', 'is_vegan', 'is_gluten_free', 'spice_level', 'allergens')
        }),
        ('Nutritional Information', {
            'classes': ('collapse',),
            'fields': ('calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sodium', 'sugar')
        }),
        ('Operational', {
            'classes': ('collapse',),
            'fields': ('ingredients', 'prep_time')
        }),
    )

@admin.register(RestaurantReview)
class RestaurantReviewAdmin(admin.ModelAdmin):
    """Admin configuration for RestaurantReview"""
    form = RestaurantReviewAdminForm
    list_display = ('user', 'restaurant', 'rating', 'created_at')
    list_filter = ('restaurant', 'rating')
    search_fields = ('user__username', 'restaurant__name', 'comment')
    ordering = ('-created_at',)
    
    def images_preview(self, obj):
        if not obj or not obj.pk or not obj.images:
            return "No images"
        tags = []
        for url in obj.images:
            tags.append(f'<a href="{url}" target="_blank"><img src="{url}" style="max-height:80px; max-width:120px; margin:3px; border:1px solid #ddd; padding:2px;" /></a>')
        return mark_safe(''.join(tags))

    images_preview.short_description = "Current Images"

    fieldsets = (
        (None, {
            'fields': ('restaurant', 'user', 'rating', 'comment')
        }),
        ('Images', {
            'fields': ('image_uploads', 'replace_images', 'images_preview')
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'images_preview')

# Unregister the base model if you are using a proxy model, otherwise not needed.
# Example:
# from django.contrib.auth.models import User
# from .models import MyUser
# admin.site.unregister(User)
# admin.site.register(MyUser)
