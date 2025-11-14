from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Restaurant, MenuCategory, MenuItem, RestaurantReview

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
        return list(allergens)
    
    def clean_ingredients(self):
        """Convert comma-separated ingredients to JSON list"""
        ingredients = self.cleaned_data.get('ingredients', '')
        if ingredients:
            # Split by comma and clean up
            ingredient_list = [ingredient.strip() for ingredient in ingredients.split(',') if ingredient.strip()]
            return ingredient_list
        return []

    def save(self, commit=True):
        """Save the form and build nutritional_info from individual fields"""
        instance = super().save(commit=False)
        
        # Build nutritional_info dict from individual fields
        nutrition = {}
        nutrition_fields = ['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sodium', 'sugar']
        
        for field_name in nutrition_fields:
            value = self.cleaned_data.get(field_name)
            if value is not None:
                nutrition[field_name] = value
        
        instance.nutritional_info = nutrition
        
        if commit:
            instance.save()
        return instance

class MenuItemAdmin(admin.ModelAdmin):
    form = MenuItemAdminForm
    list_display = ['name', 'restaurant', 'category', 'price', 'is_available', 'allergen_display', 'dietary_info']
    list_filter = ['restaurant', 'category', 'is_available', 'is_vegetarian', 'is_vegan', 'is_gluten_free', 'spice_level']
    search_fields = ['name', 'description', 'ingredients']
    ordering = ['restaurant', 'category', 'name']
    list_per_page = 25
    
    fieldsets = (
        ('📍 Basic Information', {
            'fields': ('restaurant', 'category', 'name', 'description', 'price', 'image'),
            'classes': ['wide'],
        }),
        ('🥘 Ingredients & Allergens', {
            'fields': ('ingredients', 'allergens'),
            'classes': ['collapse'],
            'description': 'Specify ingredients and allergens for this menu item. This information helps customers with dietary restrictions.',
        }),
        ('📊 Nutritional Information', {
            'fields': (('calories', 'protein'), ('carbohydrates', 'fat'), ('fiber', 'sodium'), ('sugar',)),
            'classes': ['collapse'],
            'description': 'Optional nutritional data per serving. Leave fields blank if information is not available.',
        }),
        ('🌱 Dietary Information', {
            'fields': ('is_vegetarian', 'is_vegan', 'is_gluten_free', 'spice_level'),
            'classes': ['wide'],
        }),
        ('⏰ Availability & Timing', {
            'fields': ('is_available', 'prep_time'),
            'classes': ['wide'],
        }),
    )
    
    class Media:
        css = {
            'all': ('admin/css/menu_admin.css',)
        }
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # Add helpful placeholders and help text
        if 'description' in form.base_fields:
            form.base_fields['description'].widget.attrs.update({
                'placeholder': 'Describe this delicious dish, including key ingredients and preparation style...'
            })
        
        if 'prep_time' in form.base_fields:
            form.base_fields['prep_time'].help_text = 'Estimated preparation time in minutes (helps set customer expectations)'
            
        if 'price' in form.base_fields:
            form.base_fields['price'].help_text = 'Price in dollars (e.g., 12.99)'
        
        return form
    
    def allergen_display(self, obj):
        """Display allergens in a user-friendly way"""
        if not obj.allergens:
            return format_html('<span style="color: #28a745; font-weight: bold;">✅ None</span>')
        
        allergen_icons = {
            'dairy': '🥛 Dairy',
            'eggs': '🥚 Eggs',
            'fish': '🐟 Fish',
            'shellfish': '🦐 Shellfish',
            'tree_nuts': '🌰 Tree Nuts',
            'peanuts': '🥜 Peanuts',
            'wheat': '🌾 Wheat',
            'soy': '🫘 Soy',
            'sesame': '🌱 Sesame',
            'sulphites': '⚡ Sulphites',
            'mustard': '🌭 Mustard',
            'celery': '🥬 Celery',
            'lupin': '🌿 Lupin',
            'molluscs': '🐚 Molluscs',
        }
        
        allergen_display = []
        for allergen in obj.allergens:
            display_name = allergen_icons.get(allergen, f'⚠️ {allergen.title()}')
            allergen_display.append(display_name)
        
        allergen_list = '<br>'.join(allergen_display)
        return format_html('<div class="allergen-display" style="font-size: 11px; line-height: 1.4;">{}</div>', allergen_list)
    
    allergen_display.short_description = '🚨 Allergens'
    
    def dietary_info(self, obj):
        """Display dietary information with icons"""
        info = []
        if obj.is_vegetarian:
            info.append('<span style="color: #28a745;">🌱 Vegetarian</span>')
        if obj.is_vegan:
            info.append('<span style="color: #28a745;">🌿 Vegan</span>')
        if obj.is_gluten_free:
            info.append('<span style="color: #007cba;">🚫🌾 Gluten-Free</span>')
        if obj.spice_level > 0:
            spice_display = '🌶️' * min(obj.spice_level, 5)
            info.append(f'<span style="color: #dc3545;">{spice_display} Level {obj.spice_level}</span>')
        
        result = '<br>'.join(info) if info else '<span style="color: #6c757d;">Standard</span>'
        return format_html('<div class="dietary-info" style="font-size: 11px; line-height: 1.4;">{}</div>', result)
    
    dietary_info.short_description = '🍽️ Dietary Info'
    
    def save_model(self, request, obj, form, change):
        """Add helpful success message"""
        super().save_model(request, obj, form, change)
        action = 'updated' if change else 'created'
        self.message_user(
            request, 
            f'Menu item "{obj.name}" has been {action} successfully! 🎉',
            level='SUCCESS'
        )

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'cuisine_type', 'price_range', 'rating', 'is_active']
    list_filter = ['cuisine_type', 'price_range', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['-rating', 'name']

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'display_order']
    list_filter = ['restaurant']
    ordering = ['restaurant', 'display_order']

@admin.register(RestaurantReview)
class RestaurantReviewAdmin(admin.ModelAdmin):
    list_display = ['restaurant', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    ordering = ['-created_at']

# Unregister the default MenuItem admin if it was already registered
try:
    admin.site.unregister(MenuItem)
except admin.sites.NotRegistered:
    pass

# Register with our custom admin
admin.site.register(MenuItem, MenuItemAdmin)
