import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Animated shimmer effect
class ShimmerPlaceholder extends React.Component {
  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(0);
  }

  componentDidMount() {
    this.startAnimation();
  }

  startAnimation = () => {
    this.animatedValue.setValue(0);
    Animated.loop(
      Animated.timing(this.animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  };

  render() {
    const { width, height, style, borderRadius = 8 } = this.props;
    
    const translateX = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-width, width],
    });

    return (
      <View style={[{ width, height, backgroundColor: '#E0E0E0', borderRadius, overflow: 'hidden' }, style]}>
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            transform: [{ translateX }],
          }}
        >
          <LinearGradient
            colors={['#E0E0E0', '#F0F0F0', '#E0E0E0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
    );
  }
}

// Restaurant Card Skeleton
export const RestaurantCardSkeleton = () => (
  <View style={styles.restaurantCard}>
    <ShimmerPlaceholder width="100%" height={200} borderRadius={12} />
    <View style={styles.cardContent}>
      <ShimmerPlaceholder width="70%" height={20} style={{ marginBottom: 8 }} />
      <ShimmerPlaceholder width="40%" height={16} style={{ marginBottom: 12 }} />
      <ShimmerPlaceholder width="100%" height={14} style={{ marginBottom: 6 }} />
      <ShimmerPlaceholder width="80%" height={14} style={{ marginBottom: 12 }} />
      <View style={styles.row}>
        <ShimmerPlaceholder width={60} height={24} borderRadius={12} />
        <ShimmerPlaceholder width={80} height={24} borderRadius={12} />
      </View>
    </View>
  </View>
);

// Menu Item Skeleton
export const MenuItemSkeleton = () => (
  <View style={styles.menuItem}>
    <ShimmerPlaceholder width={100} height={100} borderRadius={8} />
    <View style={styles.menuItemContent}>
      <ShimmerPlaceholder width="80%" height={18} style={{ marginBottom: 6 }} />
      <ShimmerPlaceholder width="100%" height={14} style={{ marginBottom: 6 }} />
      <ShimmerPlaceholder width="60%" height={14} style={{ marginBottom: 8 }} />
      <View style={styles.row}>
        <ShimmerPlaceholder width={60} height={20} />
        <ShimmerPlaceholder width={80} height={32} borderRadius={16} />
      </View>
    </View>
  </View>
);

// Restaurant Detail Header Skeleton
export const RestaurantDetailHeaderSkeleton = () => (
  <View style={styles.detailHeader}>
    <ShimmerPlaceholder width="100%" height={250} borderRadius={0} />
    <View style={styles.detailInfo}>
      <ShimmerPlaceholder width="70%" height={24} style={{ marginBottom: 8 }} />
      <ShimmerPlaceholder width="50%" height={16} style={{ marginBottom: 12 }} />
      <View style={styles.row}>
        <ShimmerPlaceholder width={80} height={30} borderRadius={15} style={{ marginRight: 8 }} />
        <ShimmerPlaceholder width={60} height={30} borderRadius={15} />
      </View>
    </View>
  </View>
);

// Cart Item Skeleton
export const CartItemSkeleton = () => (
  <View style={styles.cartItem}>
    <ShimmerPlaceholder width={80} height={80} borderRadius={8} />
    <View style={styles.cartItemContent}>
      <ShimmerPlaceholder width="70%" height={18} style={{ marginBottom: 6 }} />
      <ShimmerPlaceholder width="50%" height={14} style={{ marginBottom: 8 }} />
      <View style={styles.row}>
        <ShimmerPlaceholder width={60} height={16} />
        <ShimmerPlaceholder width={80} height={30} borderRadius={6} />
      </View>
    </View>
  </View>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
  <View style={styles.orderCard}>
    <View style={[styles.row, { marginBottom: 12 }]}>
      <ShimmerPlaceholder width={100} height={16} />
      <ShimmerPlaceholder width={70} height={24} borderRadius={12} />
    </View>
    <ShimmerPlaceholder width="80%" height={16} style={{ marginBottom: 8 }} />
    <ShimmerPlaceholder width="60%" height={14} style={{ marginBottom: 12 }} />
    <View style={styles.row}>
      <ShimmerPlaceholder width={80} height={20} />
      <ShimmerPlaceholder width={100} height={36} borderRadius={8} />
    </View>
  </View>
);

// Profile Header Skeleton
export const ProfileHeaderSkeleton = () => (
  <View style={styles.profileHeader}>
    <ShimmerPlaceholder width={100} height={100} borderRadius={50} style={{ marginBottom: 12 }} />
    <ShimmerPlaceholder width={150} height={20} style={{ marginBottom: 6 }} />
    <ShimmerPlaceholder width={120} height={14} />
  </View>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
  <View style={styles.listItem}>
    <ShimmerPlaceholder width={40} height={40} borderRadius={20} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <ShimmerPlaceholder width="60%" height={16} style={{ marginBottom: 6 }} />
      <ShimmerPlaceholder width="40%" height={14} />
    </View>
    <ShimmerPlaceholder width={24} height={24} borderRadius={12} />
  </View>
);

// Search Bar Skeleton
export const SearchBarSkeleton = () => (
  <View style={styles.searchBar}>
    <ShimmerPlaceholder width="100%" height={50} borderRadius={25} />
  </View>
);

// Category Chip Skeleton
export const CategoryChipSkeleton = () => (
  <View style={styles.categoryChip}>
    <ShimmerPlaceholder width={100} height={36} borderRadius={18} />
  </View>
);

// Full Screen Skeletons
export const HomeScreenSkeleton = () => (
  <View style={styles.container}>
    <SearchBarSkeleton />
    <View style={styles.categoryRow}>
      {[1, 2, 3, 4].map(i => (
        <CategoryChipSkeleton key={i} />
      ))}
    </View>
    <View style={{ marginTop: 16 }}>
      {[1, 2, 3].map(i => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </View>
  </View>
);

export const RestaurantDetailSkeleton = () => (
  <View style={styles.container}>
    <RestaurantDetailHeaderSkeleton />
    <View style={{ padding: 16 }}>
      {[1, 2, 3, 4].map(i => (
        <MenuItemSkeleton key={i} />
      ))}
    </View>
  </View>
);

export const CartScreenSkeleton = () => (
  <View style={styles.container}>
    <View style={{ padding: 16 }}>
      <ShimmerPlaceholder width={150} height={28} style={{ marginBottom: 20 }} />
      {[1, 2, 3].map(i => (
        <CartItemSkeleton key={i} />
      ))}
    </View>
  </View>
);

export const OrdersScreenSkeleton = () => (
  <View style={styles.container}>
    <View style={{ padding: 16 }}>
      <ShimmerPlaceholder width={120} height={28} style={{ marginBottom: 20 }} />
      {[1, 2, 3, 4].map(i => (
        <OrderCardSkeleton key={i} />
      ))}
    </View>
  </View>
);

export const ProfileScreenSkeleton = () => (
  <View style={styles.container}>
    <ProfileHeaderSkeleton />
    <View style={{ padding: 16, marginTop: 20 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <ListItemSkeleton key={i} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailHeader: {
    backgroundColor: 'white',
  },
  detailInfo: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
  },
  cartItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default {
  RestaurantCardSkeleton,
  MenuItemSkeleton,
  RestaurantDetailHeaderSkeleton,
  CartItemSkeleton,
  OrderCardSkeleton,
  ProfileHeaderSkeleton,
  ListItemSkeleton,
  SearchBarSkeleton,
  CategoryChipSkeleton,
  HomeScreenSkeleton,
  RestaurantDetailSkeleton,
  CartScreenSkeleton,
  OrdersScreenSkeleton,
  ProfileScreenSkeleton,
};
