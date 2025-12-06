import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import PressableScale from '../components/PressableScale';

const MenuItemDetailScreen = ({ route, navigation }) => {
  const { item: passedItem, restaurant: passedRestaurant, id, itemId, slug } = route.params || {};
  const theme = useTheme();
  const { addToCart, menuItems, restaurants, loadMenuItems, showSnackbar } = useApp();
  const item = passedItem 
    || (slug ? menuItems?.find(m => m.slug === slug) : null)
    || menuItems?.find(m => String(m.id) === String(itemId || id));
  const restaurant = passedRestaurant || (item ? restaurants?.find(r => String(r.id) === String(item.restaurant)) : null);

  React.useEffect(() => {
    if (!item && (!menuItems || menuItems.length === 0)) {
      loadMenuItems();
    }
  }, []);

  // One-time snackbar if item lookup fails
  const missingItemToastShown = React.useRef(false);
  if (!item && !missingItemToastShown.current) {
    missingItemToastShown.current = true;
    showSnackbar('Menu item not found', 
      {
        label: 'Back',
        onPress: () => navigation.goBack()
      }
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Menu item not found</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAdd = () => {
    addToCart(item, restaurant || null, 1);
    navigation.navigate('MainTabs', { screen: 'CartTab' });
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }} style={styles.image} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{item.name}</Text>
          {restaurant?.name ? (
            <Text style={styles.subtitle}>{restaurant.name}</Text>
          ) : null}
          <Text style={styles.price}>GHC {parseFloat(item.price).toFixed(2)}</Text>
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}

          <View style={styles.tags}>
            {item.is_vegetarian ? <Text style={[styles.tag, styles.veg]}>🌱 Vegetarian</Text> : null}
            {item.is_vegan ? <Text style={[styles.tag, styles.veg]}>🌿 Vegan</Text> : null}
            {item.is_gluten_free ? <Text style={[styles.tag, styles.gf]}>🌾 Gluten-free</Text> : null}
            {item.spice_level > 0 ? <Text style={[styles.tag, styles.spice]}>🌶️ x{Math.min(item.spice_level,4)}</Text> : null}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <PressableScale onPress={handleAdd}>
          <View style={styles.bottomBtn}>
            <Text style={styles.bottomBtnText}>Add to Cart</Text>
            <Text style={styles.bottomBtnPrice}>GHC {parseFloat(item.price).toFixed(2)}</Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: { paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  muted: { color: theme.colors.textSecondary, marginBottom: 16 },
  header: { position: 'relative' },
  backBtn: { position: 'absolute', top: 12, left: 12, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 18 },
  image: { width: '100%', height: 260 },
  card: { backgroundColor: theme.colors.surface, margin: 16, borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 4 },
  subtitle: { color: '#777', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: 'bold', color: theme.colors.tertiary, marginBottom: 10 },
  description: { color: '#555', lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginBottom: 16 },
  tag: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 6, marginBottom: 6, color: theme.colors.textPrimary },
  veg: { backgroundColor: '#d4edda' },
  gf: { backgroundColor: '#cce7ff' },
  spice: { backgroundColor: '#fff3cd' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.surface, padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.divider, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: -1 } },
  bottomBtn: { backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bottomBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  bottomBtnPrice: { color: '#fff', fontWeight: '700', fontSize: 14, opacity: 0.9 },
});

export default MenuItemDetailScreen;
