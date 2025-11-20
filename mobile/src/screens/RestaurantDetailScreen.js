import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from '../components/PressableScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { formatPriceRange } from '../utils/formatters';
import { RestaurantDetailSkeleton } from '../components/SkeletonLoader';

const { width, height } = Dimensions.get('window');

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant: passedRestaurant, id, slug } = route.params || {};
  const { restaurants, menuItems, addToCart, loadMenuItems, getCartItemCount, getCartTotal, showSnackbar } = useApp();
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [quantities, setQuantities] = useState({});
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const cartBounce = useRef(new Animated.Value(1)).current;
  const restaurant = passedRestaurant 
    || (slug ? restaurants?.find(r => r.slug === slug) : null)
    || (id ? restaurants?.find(r => String(r.id) === String(id)) : null);

  const itemCount = getCartItemCount();
  useEffect(() => {
    if (itemCount > 0) {
      Animated.sequence([
        Animated.timing(cartBounce, { toValue: 1.06, duration: 120, useNativeDriver: true }),
        Animated.spring(cartBounce, { toValue: 1, friction: 4, useNativeDriver: true })
      ]).start();
    }
  }, [itemCount]);

  // Show a one-time snackbar if slug/id lookup fails
  const missingToastShown = useRef(false);
  if (!restaurant && !missingToastShown.current) {
    missingToastShown.current = true;
    showSnackbar('Restaurant not found', {
      label: 'Back',
      onPress: () => navigation.goBack()
    });
  }
  // Return early if no restaurant data
  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>Restaurant not found</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Load menu items when screen mounts
  useEffect(() => {
    // Loading menu items
    loadMenuItems();
  }, []);

  useEffect(() => {
    if (!restaurant) return;
    
    // Restaurant detail screen restaurant info
    // Total menu items available
    
    // Filter menu items for this restaurant - try both ID and name matching
    const filteredMenu = menuItems.filter(item => {
      const matchesId = item.restaurant === restaurant.id;
      const matchesName = item.restaurant_name === restaurant.name;
      
      // Matched menu item
      
      return matchesId || matchesName;
    });
    
    // Filtered menu items count
    setRestaurantMenu(filteredMenu);
  }, [menuItems, restaurant]);

  const getQuantity = (itemId) => quantities[itemId] || 1;

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    setQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleAddToCart = (item) => {
    const quantity = getQuantity(item.id);
    // Pass restaurant data with the item
    addToCart(item, {
      id: restaurant.id,
      name: restaurant.name,
      delivery_fee: restaurant.delivery_fee,
      delivery_time: restaurant.delivery_time,
      min_order: restaurant.min_order
    }, quantity);
    
    Alert.alert(
      'Added to Cart',
      `${quantity}x ${item.name} added to cart!`,
      [
        { text: 'Continue Shopping', style: 'default' },
        { text: 'View Cart', onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }) }
      ]
    );
    
    // Reset quantity to 1
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const getSpiceLevel = (level) => {
    if (level <= 0) return '';
    return '🌶️'.repeat(Math.min(level, 4));
  };

  // Show skeleton if menu is loading and empty
  if (menuItems.length === 0 && restaurantMenu.length === 0) {
    return <RestaurantDetailSkeleton />;
  }

  const renderHeader = () => (
    <View pointerEvents="box-none">
      {/* Restaurant Header */}
      <View style={styles.restaurantHeader}>
        <View style={styles.backOverlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backOverlayButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <Image
          source={{
            uri: restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'
          }}
          style={styles.restaurantImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        >
          <View style={styles.restaurantInfo} pointerEvents="box-none">
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
            <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
            
            <View style={styles.restaurantMeta}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#ffd700" />
                <Text style={styles.rating}>{restaurant.rating || '4.5'}</Text>
              </View>
              <Text style={styles.priceRange}>{formatPriceRange(restaurant.price_range)}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Restaurant Details */}
      <View style={[styles.detailsSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailLabel}>Delivery</Text>
            <Text style={styles.detailValue}>{restaurant.delivery_time || '30-45 min'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="bicycle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailLabel}>Delivery Fee</Text>
            <Text style={styles.detailValue}>{restaurant.delivery_fee ? `GHC ${restaurant.delivery_fee}` : 'GHC 2.99'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailLabel}>Min Order</Text>
            <Text style={styles.detailValue}>{restaurant.min_order ? `GHC ${restaurant.min_order}` : 'GHC 15.00'}</Text>
          </View>
        </View>
      </View>

      {/* Menu Title */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Menu ({restaurantMenu.length} items)</Text>
      </View>
    </View>
  );

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItemCard}>
      <TouchableOpacity onPress={() => navigation.navigate('MenuItemDetail', { item, restaurant })}>
        <Image
          source={{
            uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'
          }}
          style={styles.menuItemImage}
        />
      </TouchableOpacity>
      <View style={styles.menuItemInfo}>
        <View style={styles.menuItemHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('MenuItemDetail', { item, restaurant })} style={{ flex: 1 }}>
            <Text style={styles.menuItemName}>{item.name}</Text>
          </TouchableOpacity>
          <Text style={[styles.menuItemPrice, { color: theme.colors.tertiary }]}>GHC {parseFloat(item.price).toFixed(2)}</Text>
        </View>
        <Text style={[styles.menuItemDescription, { color: theme.colors.textSecondary }]}>{item.description}</Text>
        <View style={styles.tagsContainer}>
          {item.is_vegetarian && (
            <View style={[styles.tag, { backgroundColor: theme.colors.successContainer }]}>
              <Text style={styles.tagText}>🌱 Veg</Text>
            </View>
          )}
          {item.is_vegan && (
            <View style={[styles.tag, { backgroundColor: theme.colors.successContainer }]}>
              <Text style={styles.tagText}>🌿 Vegan</Text>
            </View>
          )}
          {item.is_gluten_free && (
            <View style={[styles.tag, { backgroundColor: theme.colors.infoContainer }]}>
              <Text style={styles.tagText}>🌾 GF</Text>
            </View>
          )}
          {item.spice_level > 0 && (
            <View style={[styles.tag, { backgroundColor: theme.colors.warningContainer }]}>
              <Text style={styles.tagText}>{getSpiceLevel(item.spice_level)}</Text>
            </View>
          )}
        </View>
        <View style={styles.metaInfo}>
          <Text style={styles.prepTime}>⏱️ {item.prep_time}m</Text>
          <Text style={[styles.availability, { color: item.is_available ? theme.colors.tertiary : theme.colors.error }]}>
            {item.is_available ? '✅ Available' : '❌ Unavailable'}
          </Text>
        </View>
        {item.is_available && (
          <View style={styles.cartControls}>
            <View style={[styles.quantityContainer, { backgroundColor: theme.colors.background }]}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => updateQuantity(item.id, getQuantity(item.id) - 1)}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{getQuantity(item.id)}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => updateQuantity(item.id, getQuantity(item.id) + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <PressableScale onPress={() => handleAddToCart(item)}>
              <View style={[styles.addToCartButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </View>
            </PressableScale>
          </View>
        )}
      </View>
    </View>
  );


  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        contentContainerStyle={[styles.listContainer]}
        data={restaurantMenu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderMenuItem({ item })}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={[styles.menuSection, styles.emptyMenu]}>
            <Ionicons name="restaurant-outline" size={48} color="#ccc" />
            <Text style={styles.emptyMenuText}>No menu items available</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
        showsVerticalScrollIndicator={true}
      />
      {getCartItemCount() > 0 && (
        <View style={[styles.cartBar, { paddingBottom: 10 + (insets?.bottom || 0), backgroundColor: theme.colors.surface }]}>
          <View style={styles.cartBarContent}>
            <View>
              <Text style={styles.cartBarText}>{getCartItemCount()} item{getCartItemCount() > 1 ? 's' : ''} in cart</Text>
              <Text style={[styles.cartBarPrice, { color: theme.colors.tertiary }]}>GHC {getCartTotal().toFixed(2)}</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: cartBounce }] }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View cart"
                style={[styles.cartBarButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
              >
                <Text style={styles.cartBarButtonText}>View Cart</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    // Removed web-specific styles
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  restaurantHeader: {
    position: 'relative',
  },
  backOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 3,
  },
  backOverlayButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 18,
    padding: 8,
  },
  restaurantImage: {
    width: '100%',
    height: 250,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    // Ensure overlay doesn't block wheel/touch scrolling on web
    ...(Platform.OS === 'web' ? { pointerEvents: 'none' } : {}),
  },
  restaurantInfo: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  restaurantCuisine: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 10,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  priceRange: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  detailsSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuList: {
    paddingBottom: 20,
  },
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItemImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  menuItemInfo: {
    padding: 15,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  // Tag backgrounds now themed inline via theme.colors.*Container
  tagText: {
    fontSize: 10,
    color: '#333',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  prepTime: {
    fontSize: 12,
    color: '#666',
  },
  availability: {
    fontSize: 12,
    fontWeight: '500',
  },
  available: {
    color: '#28a745',
  },
  unavailable: {
    color: '#dc3545',
  },
  cartControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 5,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#007bff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyMenu: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMenuText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  cartBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartBarText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  cartBarPrice: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '700',
  },
  cartBarButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cartBarButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RestaurantDetailScreen;