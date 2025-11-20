import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IconWithFallback from '../components/IconWithFallback';
import { useApp } from '../context/AppContext';
import { CartScreenSkeleton } from '../components/SkeletonLoader';

// Helper to format currency consistently
const formatCurrency = (value) => `GHC ${parseFloat(value).toFixed(2)}`;

const CartScreen = ({ navigation }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount,
    clearCart
  } = useApp();

  // Get delivery fee from restaurant data in cart items (assume all items from same restaurant)
  const getDeliveryFee = () => {
    if (cart.length === 0) return 2.99;
    const restaurantData = cart[0]?.restaurantData;
    return parseFloat(restaurantData?.delivery_fee || 2.99);
  };

  const TAX_RATE = 0.08; // 8% tax
  const deliveryFee = getDeliveryFee();

  const handleRemoveItem = (item) => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.name} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item.id) }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  const handleCheckout = () => {
    Alert.alert(
      'Checkout',
      `Proceed with order for $${getCartTotal().toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Order Now',
          onPress: () => {
            Alert.alert('Order Placed!', 'Your order has been placed successfully.');
            clearCart();
          }
        }
      ]
    );
  };

  const renderCartItem = ({ item }) => {
    const unitPrice = parseFloat(item.price);
    const lineTotal = unitPrice * item.quantity;
    return (
      <View style={styles.cartItem} accessibilityRole="summary" accessibilityLabel={`${item.name}, quantity ${item.quantity}, total ${formatCurrency(lineTotal)}`}>        
        <Image
          source={{
            uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160&h=160&fit=crop'
          }}
          style={styles.itemImage}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          {!!item.restaurant_name && (
            <Text style={styles.itemRestaurant} numberOfLines={1}>{item.restaurant_name}</Text>
          )}
          <Text style={styles.itemPrice}>{formatCurrency(unitPrice)} <Text style={styles.eachLabel}>/ each</Text></Text>
          <Text style={styles.itemSubtotal}>{formatCurrency(lineTotal)} total</Text>
        </View>
        <View style={styles.quantityColumn}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => item.quantity > 1 && updateCartQuantity(item.id, item.quantity - 1)}
              accessibilityRole="button"
              accessibilityLabel={`Decrease quantity of ${item.name}`}
              disabled={item.quantity <= 1}
            >
              <Text style={[styles.quantityButtonText, item.quantity <= 1 && styles.quantityButtonTextDisabled]}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText} accessibilityLabel={`Quantity ${item.quantity}`}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
              accessibilityRole="button"
              accessibilityLabel={`Increase quantity of ${item.name}`}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name} from cart`}
          >
            <IconWithFallback name="trash-outline" size={18} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <IconWithFallback name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some delicious items to get started!</Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('RestaurantsTab')}
            >
              <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('MenuTab')}
            >
              <Text style={styles.menuButtonText}>View Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.headerActions}>
          <View style={styles.itemCount}>
            <Text style={styles.itemCountText}>
              {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(getCartTotal())}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(getCartTotal() * TAX_RATE)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(getCartTotal() + deliveryFee + (getCartTotal() * TAX_RATE))}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  itemCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemRestaurant: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eachLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#28a745',
    marginTop: 2,
  },
  quantityColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  quantityButtonTextDisabled: {
    color: '#999',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyActions: {
    width: '100%',
  },
  browseButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  menuButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orderSummary: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CartScreen;