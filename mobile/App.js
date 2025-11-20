import React, { useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import { darkTheme, lightTheme } from './src/theme';
import { useThemePreference, ThemePreferenceProvider } from './src/context/ThemePreferenceContext';
import { Ionicons } from '@expo/vector-icons';
import { Animated, View, Text } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import RestaurantsScreen from './src/screens/RestaurantsScreen';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MenuItemDetailScreen from './src/screens/MenuItemDetailScreen';
import GlobalSnackbar from './src/components/GlobalSnackbar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const TabNavigator = () => {
  const { getCartItemCount } = useApp();
  const theme = useTheme();

  const CartIcon = ({ focused, color, size }) => {
    const count = getCartItemCount();
    const scale = useRef(new Animated.Value(1)).current;
    const badgeScale = useRef(new Animated.Value(1)).current;
    const glowScale = useRef(new Animated.Value(0)).current;
    const prevCountRef = useRef(0);
    const primary = (theme && theme.colors && theme.colors.primary) ? theme.colors.primary : '#007bff';
    useEffect(() => {
      if (count > 0) {
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.1, duration: 140, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true })
        ]).start();

        // Pulse the badge when count increases
        if (count > prevCountRef.current) {
          Animated.sequence([
            Animated.timing(badgeScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
            Animated.spring(badgeScale, { toValue: 1, friction: 6, useNativeDriver: true })
          ]).start();
        }

        // First add glow
        if (prevCountRef.current === 0) {
          glowScale.setValue(0);
          Animated.timing(glowScale, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
            glowScale.setValue(0);
          });
        }
      }
      prevCountRef.current = count;
    }, [count]);
    const name = focused ? 'cart' : 'cart-outline';
    return (
      <Animated.View style={{ transform: [{ scale }], width: size + 6, height: size + 6 }}>
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {/* Glow ring on first add */}
          {count > 0 && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                width: size + 14,
                height: size + 14,
                borderRadius: (size + 14) / 2,
                backgroundColor: `${primary}22`,
                transform: [{ scale: glowScale.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
                opacity: glowScale.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
              }}
            />
          )}
          <Ionicons name={name} size={size} color={color} />
          {/* Animated badge */}
          {count > 0 && (
            <Animated.View
              style={{
                position: 'absolute',
                right: -2,
                top: -2,
                backgroundColor: primary,
                borderRadius: 9,
                minWidth: 18,
                height: 18,
                paddingHorizontal: 4,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: badgeScale }],
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }} numberOfLines={1}>
                {count}
              </Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    );
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'RestaurantsTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'MenuTab') {
            iconName = focused ? 'menu' : 'menu-outline';
          } else if (route.name === 'CartTab') {
            return <CartIcon focused={focused} color={color} size={size} />;
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="RestaurantsTab" 
        component={RestaurantsScreen}
        options={{ title: 'Restaurants' }}
      />
      <Tab.Screen 
        name="MenuTab" 
        component={MenuScreen}
        options={{ title: 'Menu' }}
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main App Component
const AppShell = () => {
  const { theme: paperTheme } = useThemePreference();
  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        MainTabs: {
          screens: {
            HomeTab: 'home',
            RestaurantsTab: 'restaurants',
            MenuTab: 'menu',
            CartTab: 'cart',
            ProfileTab: 'profile',
          },
        },
        RestaurantDetail: 'restaurant/:slug',
        MenuItemDetail: 'menu-item/:slug',
        Login: 'login',
        Register: 'register',
      },
    },
  };
  const navTheme = {
    ...NavDefaultTheme,
    colors: {
      ...NavDefaultTheme.colors,
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.textPrimary || '#000',
      border: paperTheme.colors.border,
      notification: paperTheme.colors.primary,
    },
  };
  return (
    <PaperProvider theme={paperTheme}>
      <AppProvider>
        <SafeAreaProvider>
          <NavigationContainer theme={navTheme} linking={linking}>
          <StatusBar style="auto" />
          <Stack.Navigator initialRouteName="MainTabs">
            <Stack.Screen 
              name="MainTabs" 
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="RestaurantDetail" 
              component={RestaurantDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="MenuItemDetail" 
              component={MenuItemDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Register' }}
            />
          </Stack.Navigator>
            <GlobalSnackbar />
          </NavigationContainer>
        </SafeAreaProvider>
      </AppProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ThemePreferenceProvider>
      <AppShell />
    </ThemePreferenceProvider>
  );
}
