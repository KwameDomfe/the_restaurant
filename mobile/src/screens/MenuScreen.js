import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IconWithFallback from '../components/IconWithFallback';
import PressableScale from '../components/PressableScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from 'react-native-paper';

const MenuScreen = ({ navigation }) => {
  const { menuItems, loadMenuItems, loading, addToCart, restaurants, getCartItemCount, getCartTotal } = useApp();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const cartBounce = useRef(new Animated.Value(1)).current;
  const itemCount = getCartItemCount();
  useEffect(() => {
    if (itemCount > 0) {
      Animated.sequence([
        Animated.timing(cartBounce, { toValue: 1.06, duration: 120, useNativeDriver: true }),
        Animated.spring(cartBounce, { toValue: 1, friction: 4, useNativeDriver: true })
      ]).start();
    }
  }, [itemCount]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [quantities, setQuantities] = useState({});

  const restaurantNames = ['All', ...new Set(menuItems.map(item => item.restaurant_name))];

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    let filtered = menuItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by restaurant
    if (selectedRestaurant && selectedRestaurant !== 'All') {
      filtered = filtered.filter(item =>
        item.restaurant_name === selectedRestaurant
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedRestaurant]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMenuItems();
    setRefreshing(false);
  };

  const getQuantity = (itemId) => quantities[itemId] || 1;

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    setQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleAddToCart = (item) => {
    const quantity = getQuantity(item.id);
    addToCart(item, null, quantity);
    
    Alert.alert(
      'Added to Cart',
      `${quantity}x ${item.name} added to cart!`,
      [
        { text: 'Continue Shopping', style: 'default' },
        { text: 'View Cart', onPress: () => navigation.navigate('CartTab') }
      ]
    );
    
    // Reset quantity to 1
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const getSpiceLevel = (level) => {
    if (level <= 0) return '';
    return '🌶️'.repeat(Math.min(level, 4));
  };

  const renderMenuItem = ({ item }) => (
    <PressableScale
      style={[styles.menuItemCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        const restaurant = restaurants?.find(r => r.id === item.restaurant) ||
                           restaurants?.find(r => r.name === item.restaurant_name) ||
                           { name: item.restaurant_name, id: item.restaurant };
        navigation.navigate('MenuItemDetail', { item, restaurant });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'
          }}
          style={styles.menuItemImage}
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>GHC {parseFloat(item.price).toFixed(2)}</Text>
        </View>
        {!item.is_available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.menuItemInfo}>
        <View style={styles.menuItemHeader}>
          <Text style={[styles.menuItemName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.restaurantBadge}>
            <Text style={styles.restaurantBadgeText}>{item.restaurant_name}</Text>
          </View>
        </View>
        
        <Text style={[styles.menuItemDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        
        {/* Tags and Info */}
        <View style={styles.tagsContainer}>
          {item.is_vegetarian && (
            <View style={[styles.tag, { backgroundColor: theme.colors.successContainer }]}>
              <Text style={styles.tagText}>🌱 Vegetarian</Text>
            </View>
          )}
          {item.is_vegan && (
            <View style={[styles.tag, { backgroundColor: theme.colors.successContainer }]}>
              <Text style={styles.tagText}>🌿 Vegan</Text>
            </View>
          )}
          {item.is_gluten_free && (
            <View style={[styles.tag, { backgroundColor: theme.colors.infoContainer }]}>
              <Text style={styles.tagText}>🌾 Gluten-Free</Text>
            </View>
          )}
          {item.spice_level > 0 && (
            <View style={[styles.tag, { backgroundColor: theme.colors.warningContainer }]}>
              <Text style={styles.tagText}>{getSpiceLevel(item.spice_level)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.metaInfo}>
          <Text style={[styles.prepTime, { color: theme.colors.textSecondary }]}>⏱️ {item.prep_time}m</Text>
          <Text style={[styles.availability, { color: item.is_available ? theme.colors.tertiary : theme.colors.error }]}>
            {item.is_available ? '✅ Available' : '❌ Unavailable'}
          </Text>
        </View>
        
        {/* Cart Controls */}
        {item.is_available ? (
          <View style={styles.cartControls}>
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Qty:</Text>
              <View style={[styles.quantityContainer, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => updateQuantity(item.id, getQuantity(item.id) - 1)}
                >
                  <IconWithFallback name="remove" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{getQuantity(item.id)}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => updateQuantity(item.id, getQuantity(item.id) + 1)}
                >
                  <IconWithFallback name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <PressableScale onPress={() => handleAddToCart(item)}>
              <View style={[styles.addToCartButton, { backgroundColor: theme.colors.primary }]}>
                <IconWithFallback name="cart" size={18} color="#fff" />
                <Text style={styles.addToCartText}>Add GHC {(parseFloat(item.price) * getQuantity(item.id)).toFixed(2)}</Text>
              </View>
            </PressableScale>
          </View>
        ) : (
          <View style={styles.unavailableSection}>
            <Text style={[styles.unavailableMessage, { color: theme.colors.textSecondary }]}>Currently unavailable</Text>
          </View>
        )}
      </View>
    </PressableScale>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }] }>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Menu</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{filteredItems.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{restaurantNames.length - 1}</Text>
              <Text style={styles.statLabel}>Restaurants</Text>
            </View>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <IconWithFallback name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes, restaurants, cuisine..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={theme.colors.textMuted}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchTerm('')}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Restaurant Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {restaurantNames.map(restaurant => (
            <TouchableOpacity
              key={restaurant}
              style={[
                styles.filterButton,
                selectedRestaurant === restaurant && [styles.filterButtonActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
              ]}
              onPress={() => setSelectedRestaurant(restaurant === 'All' ? '' : restaurant)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedRestaurant === restaurant && styles.filterButtonTextActive
              ]}>
                {restaurant}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No menu items found</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>Try adjusting your search or filters</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
      {getCartItemCount() > 0 && (
        <View style={[styles.cartBar, { paddingBottom: 10 + (insets?.bottom || 0), backgroundColor: theme.colors.surface }] }>
          <View style={styles.cartBarContent}>
            <View>
              <Text style={[styles.cartBarText, { color: theme.colors.textPrimary }]}>{getCartItemCount()} item{getCartItemCount() > 1 ? 's' : ''} in cart</Text>
              <Text style={[styles.cartBarPrice, { color: theme.colors.tertiary }]}>GHC {getCartTotal().toFixed(2)}</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: cartBounce }] }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View cart"
                style={[styles.cartBarButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('CartTab')}
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
    marginHorizontal: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItemImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  menuItemInfo: {
    padding: 16,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
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
  restaurantName: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 8,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  prepTime: {
    fontSize: 14,
    color: '#666',
  },
  availability: {
    fontSize: 14,
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
    width: 30,
    height: 30,
    backgroundColor: '#007bff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});

export default MenuScreen;