import React, { useState, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { CartProvider, useCart } from './context/CartContext';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import RestaurantDetailPage from './pages/RestaurantDetailPage.jsx';
import MenuItemDetailPage from './pages/MenuItemDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import CategoryDetailPage from './pages/CategoryDetailPage.jsx';
import RestaurantsPage from './pages/RestaurantPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import VendorDashboard from './pages/VendorDashboard.jsx';
import ManageRestaurantMenu from './pages/ManageRestaurantMenu.jsx';
import './App.css';
import MainFooter from './components/MainFooter.jsx';
import MainHeader from './components/MainHeader.jsx';
import HomePage from './pages/HomePage.jsx';

// Context setup
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Restore user from token on mount
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        // Verify token and get user data
        const response = await axios.get(`${API_BASE_URL}/accounts/users/me/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        // Token is invalid or expired, remove it
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    };

    restoreUser();
  }, [API_BASE_URL]);

  // Simple toast helper; replace with a real toast component if available
  const showToast = (message, type = 'info') => {
    try {
      // If a global toast system exists, hook here
      if (window && window.dispatchEvent) {
        const evt = new CustomEvent('app:toast', { detail: { message, type } });
        window.dispatchEvent(evt);
      }
    } catch (_) {}
    // Fallback to alert for now
    if (type === 'error') {
      console.error(message);
    }
    // Avoid blocking UX with alert; log to console
    // console.log(`[${type}] ${message}`);
  };
  const value = {
    restaurants,
    setRestaurants,
    menuItems,
    setMenuItems,
    loading,
    setLoading,
    error,
    setError,
    user,
    setUser,
    showToast,
    API_BASE_URL
  };
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};

// Optional: Floating cart button
const FloatingCartButton = () => {
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getCartItemCount ? getCartItemCount() : 0;
  const hiddenOn = ['/cart', '/checkout', '/login', '/forgot-password'];
  if (hiddenOn.includes(location.pathname) || cartCount === 0) return null;
  return (
    <button
      className="btn btn-warning rounded-circle position-fixed shadow-lg floating-cart-btn"
      style={{ bottom: '2rem', right: '2rem', width: '60px', height: '60px', zIndex: 1000 }}
      onClick={() => navigate('/cart')}
      aria-label={`View cart with ${cartCount} items`}
    >
      <div className="position-relative">
        🛒
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {cartCount}
        </span>
      </div>
    </button>
  );
};

// Main App component with floating cart button and error boundary
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { /* error captured */ }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Unexpected Error</h4>
            <p>Something went wrong rendering the application.</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const location = useLocation();
  const mainRef = React.useRef(null);

  // Update document title based on route
  useEffect(() => {
    const path = location.pathname;
    const brand = 'The Restaurant';
    let title = brand;
    const last = decodeURIComponent(path.split('/').filter(Boolean).pop() || '');
    if (path === '/') title = `Home • ${brand}`;
    else if (path.startsWith('/restaurants/')) title = `Restaurant Details • ${brand}`;
    else if (path === '/restaurants') title = `Restaurants • ${brand}`;
    else if (path === '/menu') title = `Menu • ${brand}`;
    else if (path.startsWith('/menu-items/')) title = `Menu Item • ${brand}`;
    else if (path === '/cart') title = `Cart • ${brand}`;
    else if (path === '/checkout') title = `Checkout • ${brand}`;
    else if (path === '/login') title = `Login • ${brand}`;
    else if (path === '/forgot-password') title = `Forgot Password • ${brand}`;
    else if (path === '/cuisines') title = `Popular Cuisines • ${brand}`;
    else if (path.startsWith('/cuisines/')) title = `${last} • Cuisines • ${brand}`;
    document.title = title;
  }, [location.pathname]);

  // Move focus to main content on navigation for accessibility
  useEffect(() => {
    const el = mainRef.current;
    if (el) {
      setTimeout(() => {
        try { el.focus(); } catch (_) {}
      }, 0);
    }
  }, [location.pathname]);

  return (
    <AppErrorBoundary>
      <AppProvider>
        <CartProvider>
          <div className="App min-vh-100 bg-light"
          >
            <MainHeader />
            <main id="main-content" 
              ref={mainRef} 
              tabIndex="-1" 
              role="main" 
              aria-label="Main content"
            >
              <Routes>
                <Route path="/" 
                  element={<HomePage />} 
                />
                <Route path="/restaurants" 
                  element={<RestaurantsPage />} 
                />
                <Route path="/menu" 
                  element={<MenuPage />} 
                />
                <Route path="/restaurants/:slug" 
                  element={<RestaurantDetailPage />} 
                />
                <Route path="/restaurants/:slug/menu" 
                  element={<MenuPage />} 
                />
                <Route path="/menu-items/:slug" 
                  element={<MenuItemDetailPage />} 
                />
                <Route path="/cart" 
                  element={<CartPage />} 
                />
                <Route path="/checkout" 
                  element={<CheckoutPage />} 
                />
                <Route path="/login" 
                  element={<LoginPage />} 
                />
                <Route path="/forgot-password" 
                  element={<ForgotPasswordPage />} 
                />
                <Route path="/verify-email" 
                  element={<VerifyEmailPage />} 
                />
                <Route path="/categories/:slug" 
                  element={<CategoryDetailPage />} 
                />
                <Route path="/profile" 
                  element={<ProfilePage />} 
                />
                <Route path="/orders" 
                  element={<OrdersPage />} 
                />
                <Route path="/settings" 
                  element={<SettingsPage />} 
                />
                <Route path="/vendor/dashboard" 
                  element={<VendorDashboard />} 
                />
                <Route path="/vendor/restaurants/:slug/menu" 
                  element={<ManageRestaurantMenu />} 
                />
              </Routes>
            </main>
            <FloatingCartButton />
            <MainFooter />
          </div>
        </CartProvider>
      </AppProvider>
    </AppErrorBoundary>
  );
}

export default App;