import React, { useState, useEffect, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import * as Haptics from 'expo-haptics';

// Create contexts
const AppContext = createContext();

// App Provider
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [popularCuisines, setPopularCuisines] = useState([]);
  const [mealPeriods, setMealPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarAction, setSnackbarAction] = useState(null);

  const DEFAULT_LAN_API = 'http://192.168.62.227:8000/api';
  const WEB_HOST = (typeof window !== 'undefined' && window.location && window.location.hostname)
    ? window.location.hostname
    : 'localhost';
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL
    ? process.env.EXPO_PUBLIC_API_BASE_URL
    : (Platform.OS === 'web' ? `http://${WEB_HOST}:8000/api` : DEFAULT_LAN_API);

  // Load fonts
  useEffect(() => {
    setFontsLoaded(true);
  }, []);

  // Load restaurants
  const loadRestaurants = async () => {
    setLoading(true);
    const url = `${API_BASE_URL}/restaurants/`;
    // Loading restaurants
    
    try {
      const response = await axios.get(url, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // API response received
      
      const restaurantData = response.data.results || response.data;
      // Restaurant count loaded
      
      if (restaurantData.length > 0) {
        setRestaurants(restaurantData);
        // Restaurants loaded successfully
        setError(null);
      } else {
        // API returned empty data
        setRestaurants([]);
        setError('No restaurants available');
      }
    } catch (err) {
      // API error details
      
      if (err.response) {
        // Response status/data
        setError(`Server error: ${err.response.status}`);
      } else if (err.request) {
        // No response received from server
        setError(`Cannot connect to server at ${API_BASE_URL}. Please ensure the backend is running and accessible.`);
      } else {
        // Request setup error
        setError(`Request failed: ${err.message}`);
      }
      if (Platform.OS !== 'web') {
        try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      }
      showSnackbar('Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, action = null) => {
    setSnackbarMessage(message);
    setSnackbarAction(action);
    setSnackbarVisible(true);
  };

  // Load menu items
  const loadMenuItems = async () => {
    setLoading(true);
    // Loading menu items
    
    try {
      const response = await axios.get(`${API_BASE_URL}/menu-items/`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // Menu API response received
      const menuData = response.data.results || response.data;
      
      if (menuData.length > 0) {
        setMenuItems(menuData);
        // Loaded menu items from API
        setError(null);
      } else {
        // Menu API returned empty data
        setMenuItems([]);
        setError('No menu items available');
      }
    } catch (err) {
      // Menu API Error
      setMenuItems([]);
      setError('Failed to load menu items. Please check your connection.');
      if (Platform.OS !== 'web') {
        try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      }
      showSnackbar('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  // Load popular cuisines
  const loadPopularCuisines = async () => {
    // Loading popular cuisines
    
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/popular-cuisines/`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // Popular cuisines API response received
      
      if (response.data && response.data.length > 0) {
        setPopularCuisines(response.data);
        // Popular cuisines loaded
      } else {
        // Popular cuisines API returned empty data
        setPopularCuisines([]);
      }
    } catch (err) {
      // Popular Cuisines API Error
      if (err.response) {
        // Response status/data
      }
      // Set empty to show the API isn't working
      setPopularCuisines([]);
      if (Platform.OS !== 'web') {
        try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      }
      showSnackbar('Failed to load cuisines');
    }
  };

  // Load meal periods
  const loadMealPeriods = async () => {
    // Loading meal periods
    
    try {
      const response = await axios.get(`${API_BASE_URL}/menu-items/meal-periods/`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // Meal periods API response received
      
      if (response.data && response.data.length > 0) {
        setMealPeriods(response.data);
        // Meal periods loaded
      } else {
        // Meal periods API returned empty data
        setMealPeriods([]);
      }
    } catch (err) {
      // Meal Periods API Error
      if (err.response) {
        // Response status/data
      }
      setMealPeriods([]);
      if (Platform.OS !== 'web') {
        try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      }
      showSnackbar('Failed to load meal periods');
    }
  };

  // Add item to cart
  const addToCart = (item, restaurantData = null, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        const updated = prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        showSnackbar(`${quantity}x ${item.name} added to cart`);
        return updated;
      } else {
        const updated = [...prevCart, { ...item, quantity, restaurantData }];
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
        showSnackbar(`${quantity}x ${item.name} added to cart`);
        return updated;
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === itemId);
      if (Platform.OS !== 'web') {
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      }
      if (item) {
        showSnackbar(`${item.name} removed from cart`, {
          label: 'Undo',
          onPress: () => {
            addToCart(item, item.restaurantData || null, item.quantity || 1);
          }
        });
      }
      return prevCart.filter(item => item.id !== itemId);
    });
  };

  // Update cart quantity
  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart => {
        const updated = prevCart.map(item => item.id === itemId ? { ...item, quantity } : item);
        const item = prevCart.find(i => i.id === itemId);
        if (Platform.OS !== 'web') {
          try { Haptics.selectionAsync(); } catch {}
        }
        if (item) {
          showSnackbar(`${item.name} quantity: ${quantity}`);
        }
        return updated;
      });
    }
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  const value = {
    user,
    setUser,
    restaurants,
    setRestaurants,
    menuItems,
    setMenuItems,
    cart,
    setCart,
    popularCuisines,
    setPopularCuisines,
    mealPeriods,
    setMealPeriods,
    loading,
    setLoading,
    error,
    setError,
    fontsLoaded,
    API_BASE_URL,
    snackbarVisible,
    setSnackbarVisible,
    snackbarMessage,
    snackbarAction,
    showSnackbar,
    loadRestaurants,
    loadMenuItems,
    loadPopularCuisines,
    loadMealPeriods,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount,
    clearCart
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { AppContext };