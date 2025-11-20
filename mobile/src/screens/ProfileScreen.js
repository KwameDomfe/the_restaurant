import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useThemePreference } from '../context/ThemePreferenceContext';
import { useApp } from '../context/AppContext';

const ProfileScreen = ({ navigation }) => {
  const { user, setUser } = useApp();
  const theme = useTheme();
  const { mode, setMode, toggleMode } = useThemePreference();
  const [userStats] = useState({
    orders: 12,
    favorites: 8,
    points: 250
  });

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => setUser(null) }
      ]
    );
  };

  const menuItems = [
    { icon: 'receipt-outline', title: 'Order History', subtitle: 'View past orders' },
    { icon: 'heart-outline', title: 'Favorites', subtitle: 'Your favorite restaurants' },
    { icon: 'card-outline', title: 'Payment Methods', subtitle: 'Manage payment options' },
    { icon: 'location-outline', title: 'Addresses', subtitle: 'Delivery addresses' },
    { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Notification preferences' },
    { icon: 'help-circle-outline', title: 'Help & Support', subtitle: 'Get help when you need it' },
    { icon: 'information-circle-outline', title: 'About', subtitle: 'App version and info' },
  ];

  const renderThemeControls = () => (
    <View style={styles.themeSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Appearance</Text>
      <View style={styles.themeButtonsRow}>
        {['system','light','dark'].map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => setMode(option)}
            style={[
              styles.themeButton,
              { borderColor: theme.colors.divider, backgroundColor: theme.colors.surface },
              mode === option && { borderColor: theme.colors.primary }
            ]}
          >
            <Text style={{ color: mode === option ? theme.colors.primary : theme.colors.textSecondary, fontWeight: '600' }}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={toggleMode} style={[styles.quickToggle, { backgroundColor: theme.colors.primary }]}> 
        <Text style={styles.quickToggleText}>Quick Toggle (Light/Dark)</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }] }>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Profile</Text>
        </View>
        
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={80} color={theme.colors.textMuted} />
          <Text style={[styles.guestTitle, { color: theme.colors.textPrimary }]}>Welcome to The Restaurant</Text>
          <Text style={[styles.guestSubtitle, { color: theme.colors.textSecondary }]}>
            Sign in to access your orders, favorites, and personalized recommendations
          </Text>
          
          <View style={styles.authButtons}>
            <TouchableOpacity style={[styles.loginButton, { backgroundColor: theme.colors.primary }]} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.registerButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.primary }]} onPress={handleRegister}>
              <Text style={[styles.registerButtonText, { color: theme.colors.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.guestMenu}>
            {menuItems.slice(4).map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuItemTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
          {renderThemeControls()}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }] }>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Profile</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }] }>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: user.avatar || 'https://via.placeholder.com/80x80/007bff/ffffff?text=User'
              }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{user.first_name} {user.last_name}</Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user.email}</Text>
              <Text style={[styles.userType, { color: theme.colors.primary }]}>Premium Member</Text>
            </View>
          </View>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{userStats.orders}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{userStats.favorites}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Favorites</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{userStats.points}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Points</Text>
            </View>
          </View>
        </View>
        
        {/* Menu Items */}
        <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }] }>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
          
          {/* Logout */}
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={24} color="#dc3545" />
              <View style={styles.menuItemText}>
                <Text style={[styles.menuItemTitle, styles.logoutText]}>Logout</Text>
                <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>Sign out of your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
          {renderThemeControls()}
        </View>
      </ScrollView>
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
  },
  content: {
    flex: 1,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  authButtons: {
    width: '100%',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  registerButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  guestMenu: {
    width: '100%',
  },
  profileSection: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 15,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutText: {
    color: '#dc3545',
  },
  themeSection: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  themeButtonsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 10,
  },
  quickToggle: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;