import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import IconWithFallback from '../components/IconWithFallback';
import { formatPriceRange } from '../utils/formatters';
import { HomeScreenSkeleton } from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { restaurants, loadRestaurants, popularCuisines, loadPopularCuisines, mealPeriods, loadMealPeriods, loading, getCartItemCount, addToCart } = useApp();
  const [scrollPositions, setScrollPositions] = useState({});
  const featuredScrollRef = useRef(null);
  const mealScrollRefs = useRef({});

  useEffect(() => {
    loadRestaurants();
    loadPopularCuisines();
    loadMealPeriods();
  }, []);

  // Initialize scroll positions after content loads
  useEffect(() => {
    if (restaurants.length > 0 || mealPeriods.length > 0) {
      // Small delay to ensure ScrollView has rendered
      const timer = setTimeout(() => {
        // Initialize scroll positions to show right arrow on load
        const initialPositions = {};
        
        // Featured section
        if (restaurants.length > 0) {
          initialPositions['featured'] = {
            offset: 0,
            canScrollLeft: false,
            canScrollRight: true
          };
        }
        
        // Meal period sections
        mealPeriods.forEach(period => {
          const sectionKey = `meal-${period.period}`;
          if (period.items.length > 0) {
            initialPositions[sectionKey] = {
              offset: 0,
              canScrollLeft: false,
              canScrollRight: period.items.length > 1
            };
          }
        });
        
        setScrollPositions(initialPositions);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [restaurants, mealPeriods]);

  const featuredRestaurants = restaurants.slice(0, 3);

  const handleScroll = (sectionKey, event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const scrollWidth = event.nativeEvent.layoutMeasurement.width;
    
    const canScrollLeft = offsetX > 10;
    const canScrollRight = offsetX < (contentWidth - scrollWidth - 10);
    
    setScrollPositions(prev => ({
      ...prev,
      [sectionKey]: {
        offset: offsetX,
        canScrollLeft,
        canScrollRight
      }
    }));
  };

  const handleScrollLayout = (sectionKey, event) => {
    const { width: scrollWidth } = event.nativeEvent.layout;
    // This will be called when the ScrollView is laid out
    // We can use this to initialize scroll state if needed
  };

  const handleContentSizeChange = (sectionKey, contentWidth, scrollViewWidth) => {
    const canScrollRight = contentWidth > scrollViewWidth;
    
    setScrollPositions(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        canScrollRight,
        canScrollLeft: prev[sectionKey]?.offset > 10 || false
      }
    }));
  };

  const scrollTo = (sectionKey, scrollRef, direction) => {
    if (scrollRef?.current) {
      const currentOffset = scrollPositions[sectionKey]?.offset || 0;
      const scrollAmount = direction === 'right' ? width * 0.8 : -width * 0.8;
      scrollRef.current.scrollTo({ x: currentOffset + scrollAmount, animated: true });
    }
  };

  if (loading && restaurants.length === 0) {
    return <HomeScreenSkeleton />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#007bff', '#0056b3']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.appTitle}>Welcome to The Restaurant</Text>
          <Text style={styles.subtitle}>Discover amazing restaurants and order your favorite dishes</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('RestaurantsTab')}
          >
            <Text style={styles.exploreButtonText}>Explore Restaurants 🍽️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('RestaurantsTab')}
        >
          <View style={styles.iconContainer}>
            <IconWithFallback name="restaurant-outline" size={18} color="#007bff" />
          </View>
          <Text style={styles.actionText}>Browse Restaurants</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MenuTab')}
        >
          <View style={styles.iconContainer}>
            <IconWithFallback name="book-outline" size={18} color="#007bff" />
          </View>
          <Text style={styles.actionText}>View Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, getCartItemCount() > 0 && styles.actionButtonActive]}
          onPress={() => navigation.navigate('CartTab')}
        >
          <View style={styles.cartIconContainer}>
            <View style={styles.iconContainer}>
              <IconWithFallback name="cart-outline" size={18} color={getCartItemCount() > 0 ? "#fff" : "#007bff"} />
            </View>
            {getCartItemCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.actionText, getCartItemCount() > 0 && styles.actionTextActive]}>
            Cart
          </Text>
        </TouchableOpacity>
      </View>

      {/* Featured Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Restaurants</Text>
          <View style={styles.scrollIndicatorContainer}>
            {scrollPositions['featured']?.canScrollLeft && (
              <TouchableOpacity 
                style={styles.scrollButton}
                onPress={() => scrollTo('featured', featuredScrollRef, 'left')}
              >
                <Text style={styles.scrollButtonText}>←</Text>
              </TouchableOpacity>
            )}
            <View style={styles.scrollIndicator}>
              <Text style={styles.scrollIndicatorText}>Swipe</Text>
              <Text style={styles.scrollArrow}>→</Text>
            </View>
            {scrollPositions['featured']?.canScrollRight && (
              <TouchableOpacity 
                style={styles.scrollButton}
                onPress={() => scrollTo('featured', featuredScrollRef, 'right')}
              >
                <Text style={styles.scrollButtonText}>→</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {loading ? (
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        ) : (
          <ScrollView 
            ref={featuredScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={true}
            indicatorStyle="black"
            style={styles.horizontalScrollView}
            onScroll={(e) => handleScroll('featured', e)}
            scrollEventThrottle={16}
            onContentSizeChange={(w, h) => handleContentSizeChange('featured', w, width)}
          >
            {featuredRestaurants.map(restaurant => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurant })}
              >
                <Image
                  source={{
                    uri: restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop'
                  }}
                  style={styles.restaurantImage}
                />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
                  <View style={styles.restaurantMeta}>
                    <View style={styles.ratingContainer}>
                      <View style={styles.iconContainer}>
                        <IconWithFallback name="star" size={11} color="#ffd700" />
                        <Text style={styles.starFallback}>⭐</Text>
                      </View>
                      <Text style={styles.rating}>{restaurant.rating || '4.5'}</Text>
                    </View>
                    <Text style={styles.priceRange}>{formatPriceRange(restaurant.price_range)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Popular Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Cuisines</Text>
        {popularCuisines.length > 0 ? (
          <View style={styles.categoriesGrid}>
            {popularCuisines.slice(0, 6).map(cuisine => (
              <TouchableOpacity
                key={cuisine.name}
                style={styles.categoryItem}
                onPress={() => navigation.navigate('RestaurantsTab', { filter: cuisine.name })}
              >
                <Text style={styles.categoryEmoji}>
                  {cuisine.emoji}
                </Text>
                <Text style={styles.categoryName}>{cuisine.name}</Text>
                {cuisine.restaurant_count > 0 && (
                  <Text style={styles.categoryCount}>
                    {cuisine.restaurant_count} {cuisine.restaurant_count === 1 ? 'restaurant' : 'restaurants'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Loading cuisines from database...</Text>
        )}
      </View>

      {/* Meal Periods Section */}
      {mealPeriods.length > 0 && mealPeriods.map(period => {
        const sectionKey = `meal-${period.period}`;
        if (!mealScrollRefs.current[sectionKey]) {
          mealScrollRefs.current[sectionKey] = React.createRef();
        }
        
        return (
          <View key={period.period} style={styles.section}>
            <View style={styles.mealPeriodHeader}>
              <View>
                <View style={styles.mealPeriodTitleRow}>
                  <Text style={styles.mealPeriodEmoji}>{period.emoji}</Text>
                  <Text style={styles.sectionTitle}>{period.name}</Text>
                </View>
                <Text style={styles.mealPeriodTime}>{period.time}</Text>
              </View>
              <View style={styles.scrollIndicatorContainer}>
                {scrollPositions[sectionKey]?.canScrollLeft && (
                  <TouchableOpacity 
                    style={styles.scrollButtonSmall}
                    onPress={() => scrollTo(sectionKey, mealScrollRefs.current[sectionKey], 'left')}
                  >
                    <Text style={styles.scrollButtonTextSmall}>←</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.mealPeriodBadge}>
                  <Text style={styles.mealPeriodBadgeText}>{period.items.length} items</Text>
                </View>
                {scrollPositions[sectionKey]?.canScrollRight && (
                  <TouchableOpacity 
                    style={styles.scrollButtonSmall}
                    onPress={() => scrollTo(sectionKey, mealScrollRefs.current[sectionKey], 'right')}
                  >
                    <Text style={styles.scrollButtonTextSmall}>→</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <ScrollView 
              ref={mealScrollRefs.current[sectionKey]}
              horizontal 
              showsHorizontalScrollIndicator={true}
              indicatorStyle="black"
              style={styles.horizontalScrollView}
              onScroll={(e) => handleScroll(sectionKey, e)}
              scrollEventThrottle={16}
              onContentSizeChange={(w, h) => handleContentSizeChange(sectionKey, w, width)}
            >
              {period.items.slice(0, 8).map(item => {
                // Find the full restaurant object
                const restaurant = restaurants.find(r => r.id === item.restaurant);
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.mealItemCard}
                    onPress={() => {
                      // Navigate to restaurant detail with full restaurant object
                      if (restaurant) {
                        navigation.navigate('RestaurantDetail', { restaurant });
                      }
                    }}
                  >
                    <Image source={{ uri: item.image }} style={styles.mealItemImage} />
                    <View style={styles.mealItemInfo}>
                      <Text style={styles.mealItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.mealItemRestaurant} numberOfLines={1}>{item.restaurant_name}</Text>
                      <View style={styles.mealItemBottom}>
                        <Text style={styles.mealItemPrice}>GHC {item.price}</Text>
                        {item.is_vegetarian && (
                          <View style={styles.vegBadge}>
                            <Text style={styles.vegBadgeText}>🌱</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  exploreButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  actionButtonActive: {
    backgroundColor: '#007bff',
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  iconFallback: {
    fontSize: 18,
    color: '#007bff',
    zIndex: 1,
  },
  iconFallbackActive: {
    color: '#fff',
  },
  starFallback: {
    fontSize: 11,
    color: '#ffd700',
    zIndex: 1,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scrollIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  scrollArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollButton: {
    backgroundColor: '#007bff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  scrollButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollButtonSmall: {
    backgroundColor: '#007bff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  scrollButtonTextSmall: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  horizontalScrollView: {
    flexGrow: 0,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  restaurantCard: {
    width: 250,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  priceRange: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 60) / 3,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  categoryCount: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 10,
  },
  mealPeriodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  mealPeriodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealPeriodEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  mealPeriodTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 32,
    marginTop: -5,
  },
  mealPeriodBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  mealPeriodBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mealItemCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mealItemImage: {
    width: '100%',
    height: 100,
  },
  mealItemInfo: {
    padding: 10,
  },
  mealItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mealItemRestaurant: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  mealItemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  vegBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vegBadgeText: {
    fontSize: 12,
  },
});

export default HomeScreen;