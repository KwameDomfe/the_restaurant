import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Create Application Context for global state management
const AppContext = createContext();

// Provider component to wrap the entire app
export const AppProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null); // Track which item is being added
  const [showCartPreview, setShowCartPreview] = useState(false); // Cart preview modal
  const [itemQuantities, setItemQuantities] = useState({}); // Track quantity for each item

  const API_BASE_URL = 'http://localhost:8000/api';

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  // Add item to cart
  const addToCart = (item) => {
    setAddingToCart(item.id); // Set loading state
    
    // Simulate brief loading for better UX
    setTimeout(() => {
      const quantityToAdd = item.quantity || 1;
      const existingItem = cart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        setCart(cart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
            : cartItem
        ));
        showToast(quantityToAdd === 1 
          ? `Added another ${item.name} to cart!` 
          : `Added ${quantityToAdd} more ${item.name} to cart!`, 'success');
      } else {
        setCart([...cart, { ...item, quantity: quantityToAdd }]);
        showToast(quantityToAdd === 1 
          ? `${item.name} added to cart!` 
          : `${quantityToAdd} ${item.name} added to cart!`, 'success');
      }
      
      // Show cart preview briefly
      setShowCartPreview(true);
      setTimeout(() => setShowCartPreview(false), 3000);
      
      setAddingToCart(null); // Clear loading state
    }, 300); // Brief delay for visual feedback
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    setCart(cart.filter(item => item.id !== itemId));
    if (item) {
      showToast(`${item.name} removed from cart`, 'info');
    }
  };

  // Update item quantity in cart
  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Function to add item to cart with specified quantity
  const addItemToCart = (item, quantity = 1) => {
    // Create a new item with the specified quantity
    const itemToAdd = { ...item, quantity: parseInt(quantity) || 1 };
    addToCart(itemToAdd);
    // Reset quantity to 1 after adding
    setItemQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  // Function to update item quantity
  const updateItemQuantity = (itemId, quantity) => {
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    setItemQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  // Function to get quantity for an item (default 1)
  const getItemQuantity = (itemId) => {
    return itemQuantities[itemId] || 1;
  };

  const value = {
    restaurants,
    setRestaurants,
    menuItems,
    setMenuItems,
    cart,
    setCart,
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    toast,
    showToast,
    addingToCart,
    showCartPreview,
    setShowCartPreview,
    itemQuantities,
    setItemQuantities,
    API_BASE_URL,
    addToCart,
    addItemToCart,
    updateItemQuantity,
    getItemQuantity,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Toast Notifications */}
      {toast && (
        <div 
          className={`toast show position-fixed m-3`}
          style={{ 
            zIndex: 1060,
            top: '20px',
            right: '20px',
            minWidth: '350px',
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease-out'
          }}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className={`toast-header bg-${toast.type === 'success' ? 'success' : toast.type === 'error' ? 'danger' : 'info'} text-white`}>
            <strong className="me-auto">
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} 
              {toast.type === 'success' ? 'Added to Cart!' : toast.type === 'error' ? 'Error' : 'Info'}
            </strong>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setToast(null)}
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body p-3">
            <div className="mb-2">{toast.message}</div>
            {toast.type === 'success' && (
              <div className="d-flex gap-2 mt-2">
                <button 
                  className="btn btn-primary btn-sm flex-fill"
                  onClick={() => {
                    setToast(null);
                    window.location.href = '/cart';
                  }}
                >
                  🛒 View Cart
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm flex-fill"
                  onClick={() => setToast(null)}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Quick Cart Preview Modal */}
      {showCartPreview && cart.length > 0 && (
        <div 
          className="position-fixed"
          style={{
            bottom: '20px',
            right: '20px',
            zIndex: 1055,
            animation: 'slideInUp 0.3s ease-out'
          }}
        >
          <div className="card shadow-lg border-0" style={{ minWidth: '320px', maxWidth: '400px' }}>
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">🛒 Cart Preview</h6>
              <button 
                className="btn-close btn-close-white btn-sm"
                onClick={() => setShowCartPreview(false)}
                aria-label="Close cart preview"
              ></button>
            </div>
            <div className="card-body p-3">
              <div className="small mb-2 text-muted">
                {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''} • ${getCartTotal().toFixed(2)} total
              </div>
              <div className="max-height-150 overflow-auto">
                {cart.slice(0, 3).map(item => (
                  <div key={item.id} className="d-flex align-items-center gap-2 mb-2">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=40&h=40&fit=crop'}
                      alt={item.name}
                      className="rounded"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="small fw-bold">{item.name}</div>
                      <div className="small text-muted">{item.quantity}x ${item.price}</div>
                    </div>
                  </div>
                ))}
                {cart.length > 3 && (
                  <div className="small text-muted text-center">
                    +{cart.length - 3} more item{cart.length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div className="d-grid mt-3">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowCartPreview(false);
                    window.location.href = '/cart';
                  }}
                >
                  View Full Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Modal Portal Component to render modal outside card hierarchy
const ModalPortal = ({ children, isOpen }) => {
  if (!isOpen) return null;
  
  // Create modal container if it doesn't exist
  let modalContainer = document.getElementById('modal-root');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'modal-root';
    modalContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(modalContainer);
  }
  
  return ReactDOM.createPortal(children, modalContainer);
};

// Navigation component
const Navbar = () => {
  const { getCartItemCount, user } = useApp();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={() => setIsNavCollapsed(true)}>
          🍽️ The Restaurant
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={handleNavCollapse}
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setIsNavCollapsed(true)}>
                🏠 Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/restaurants" onClick={() => setIsNavCollapsed(true)}>
                🏪 Restaurants
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/menu" onClick={() => setIsNavCollapsed(true)}>
                📋 Menu
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            {user ? (
              <span className="navbar-text me-3">Welcome, {user.username}!</span>
            ) : (
              <Link 
                to="/login" 
                className="btn btn-outline-light me-2"
                onClick={() => setIsNavCollapsed(true)}
              >
                🔐 Login
              </Link>
            )}
            
            <Link 
              to="/cart" 
              className="btn btn-warning position-relative"
              onClick={() => setIsNavCollapsed(true)}
              aria-label={`Shopping cart with ${getCartItemCount()} items`}
            >
              🛒 Cart
              {getCartItemCount() > 0 && (
                <span 
                  key={getCartItemCount()}
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge-animation"
                  aria-label={`${getCartItemCount()} items in cart`}
                  style={{
                    animation: 'cartBounce 0.6s ease-out'
                  }}
                >
                  {getCartItemCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Search and Filter component
const SearchAndFilter = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCuisineFilter = (e) => {
    const value = e.target.value;
    setCuisine(value);
    onFilter('cuisine', value);
  };

  const handlePriceFilter = (e) => {
    const value = e.target.value;
    setPriceRange(value);
    onFilter('price', value);
  };

  return (
    <div className="search-filter-container bg-light p-3 mb-4">
      <div className="row g-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search restaurants or dishes..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="col-md-3">
          <select 
            className="form-select" 
            value={cuisine} 
            onChange={handleCuisineFilter}
          >
            <option value="">All Cuisines</option>
            <option value="Italian">Italian</option>
            <option value="Chinese">Chinese</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
            <option value="American">American</option>
          </select>
        </div>
        
        <div className="col-md-3">
          <select 
            className="form-select" 
            value={priceRange} 
            onChange={handlePriceFilter}
          >
            <option value="">All Prices</option>
            <option value="budget">$ Budget</option>
            <option value="moderate">$$ Moderate</option>
            <option value="expensive">$$$ Expensive</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component for better UX during data loading
const SkeletonCard = () => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div className="card h-100 shadow-sm">
      <div className="placeholder-glow">
        <div className="placeholder bg-secondary" style={{ height: '200px', width: '100%' }}></div>
      </div>
      <div className="card-body">
        <h5 className="card-title placeholder-glow">
          <span className="placeholder col-6"></span>
        </h5>
        <p className="card-text placeholder-glow">
          <span className="placeholder col-4"></span>
        </p>
        <p className="card-text placeholder-glow">
          <span className="placeholder col-8"></span>
          <span className="placeholder col-6"></span>
        </p>
        <div className="placeholder-glow mt-3">
          <span className="placeholder col-4 me-2"></span>
          <span className="placeholder col-3"></span>
        </div>
        <div className="placeholder-glow mt-2">
          <span className="placeholder col-12 btn btn-primary disabled"></span>
        </div>
      </div>
    </div>
  </div>
);

// Helper function to get cuisine-specific placeholder image
const getCuisinePlaceholder = (cuisineType) => {
  const cuisineImages = {
    'Italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&crop=center',
    'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop&crop=center',
    'Local Dishes': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop&crop=center',
    'Chinese': 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=300&h=300&fit=crop&crop=center',
    'Mexican': 'https://images.unsplash.com/photo-1565299585323-38174c2f9a4e?w=300&h=300&fit=crop&crop=center',
    'Indian': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=300&fit=crop&crop=center',
    'American': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop&crop=center',
    'Vegetarian': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop&crop=center',
    'Thai': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=300&h=300&fit=crop&crop=center'
  };
  
  return cuisineImages[cuisineType] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=300&fit=crop&crop=center';
};

// Restaurant Card component
const RestaurantCard = ({ restaurant, showMenu = false }) => {
  const { 
    addToCart, 
    addingToCart, 
    menuItems, 
    getCartItemCount, 
    getCartTotal,
    addItemToCart,
    updateItemQuantity,
    getItemQuantity
  } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const openMenuModal = async (e) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Prevent multiple modals or double-clicking
    if (showModal || isOpening) {
      return;
    }
    
    try {
      setIsOpening(true);
      
      if (restaurantMenu.length === 0) {
        setLoadingMenu(true);
        // Load menu items for this restaurant by restaurant name
        const restaurantMenuItems = menuItems.filter(item => 
          item.restaurant_name === restaurant.name
        );
        setRestaurantMenu(restaurantMenuItems);
        setLoadingMenu(false);
      }
      
      // Add body scroll lock
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      setShowModal(true);
      setIsOpening(false);
    } catch (error) {
      setLoadingMenu(false);
      setIsOpening(false);
    }
  };

  const closeMenuModal = (e) => {
    console.log('closeMenuModal called');
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    
    setShowModal(false);
    setIsOpening(false);
  };

  // Close modal on ESC key with improved handling
  React.useEffect(() => {
    const handleEscKey = (event) => {
      // Use modern event.key instead of deprecated keyCode
      if ((event.key === 'Escape' || event.keyCode === 27) && showModal) {
        closeMenuModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscKey, true);
      // Add focus trap
      const modal = document.querySelector('.modal.show');
      if (modal) {
        modal.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey, true);
      // Restore body scroll on cleanup
      document.body.style.overflow = '';
    };
  }, [showModal]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError) {
      return getCuisinePlaceholder(restaurant.cuisine_type);
    }
    
    if (restaurant.image) {
      // If restaurant has an image URL, use it
      if (typeof restaurant.image === 'string') {
        return restaurant.image;
      }
      // If it's a file object, create URL
      if (restaurant.image instanceof File) {
        return URL.createObjectURL(restaurant.image);
      }
    }
    
    // Default to cuisine-specific placeholder
    return getCuisinePlaceholder(restaurant.cuisine_type);
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm restaurant-card">
        <div style={{ height: '300px', width: '100%', overflow: 'hidden', position: 'relative', margin: '0', aspectRatio: '1/1' }}>
          <img 
            src={getImageSrc()}
            className="card-img-top" 
            alt={restaurant.name}
            style={{ 
              height: '300px', 
              width: '100%',
              objectFit: 'cover',
              minHeight: '300px',
              maxHeight: '300px',
              position: 'absolute',
              top: '0',
              left: '0',
              aspectRatio: '1/1',
              margin: '0',
              padding: '0'
            }}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
        
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{restaurant.name}</h5>
          <p className="card-text text-muted small">{restaurant.cuisine_type}</p>
          <p className="card-text flex-grow-1">{restaurant.description}</p>
          
          <div className="mb-2">
            <small className="text-muted">
              📍 {restaurant.address}
            </small>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="badge bg-warning text-dark">
                ⭐ {restaurant.rating || '4.5'}
              </span>
              <span className="ms-2 text-success fw-bold">
                {restaurant.price_range || '$$'}
              </span>
            </div>
            <div>
              {restaurant.delivery_fee && (
                <small className="text-muted">Delivery: ${restaurant.delivery_fee}</small>
              )}
            </div>
          </div>
          
          <div className="mt-auto">
            <button 
              className="btn btn-primary w-100 mb-2"
              onClick={openMenuModal}
              disabled={loadingMenu || showModal || isOpening}
              type="button"
            >
              {loadingMenu ? 'Loading...' : 
               isOpening ? 'Opening...' :
               showModal ? 'Modal Open' : 'View Menu'} 🍽️
            </button>
          </div>
        </div>
        
        {/* Full-Screen Menu Modal using Portal */}
        <ModalPortal isOpen={showModal}>
          <div 
            className="modal show d-block position-fixed w-100 h-100" 
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.9)', 
              top: 0, 
              left: 0, 
              zIndex: 1055,
              animation: 'fullscreenFadeIn 0.3s ease-in-out',
              pointerEvents: 'auto'
            }}
            onClick={(e) => {
              // Only close if clicking the backdrop (not modal content)
              if (e.target === e.currentTarget) {
                closeMenuModal(e);
              }
            }}
            tabIndex={-1}
            role="dialog"
            aria-labelledby="modal-title"
            aria-hidden={!showModal}
          >
            <div className="modal-dialog modal-fullscreen">
              <div 
                className="modal-content h-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header py-4">
                  <div className="container-fluid">
                    <div className="row align-items-center w-100">
                      <div className="col">
                        <div className="d-flex align-items-center">
                          <div className="me-4">
                            <h3 className="modal-title mb-1" id="modal-title">
                              🍽️ {restaurant.name}
                            </h3>
                            <p className="mb-0 text-white-75 lead">
                              {restaurant.cuisine_type} • {restaurant.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto">
                        <button 
                          type="button" 
                          className="btn btn-outline-light rounded-circle" 
                          onClick={(e) => {
                            console.log('Close button clicked');
                            closeMenuModal(e);
                          }}
                          aria-label="Close"
                          style={{ 
                            fontSize: '1.2rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid white',
                            width: '45px',
                            height: '45px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-body p-4" style={{ overflowY: 'auto' }}>
                  {loadingMenu ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 h5">Loading delicious menu items...</p>
                    </div>
                  ) : restaurantMenu.length > 0 ? (
                    <div className="container-fluid">
                      {/* Menu Header */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="text-primary mb-0">
                              Our Menu ({restaurantMenu.length} items)
                            </h5>
                            <div className="d-flex gap-2">
                              <span className="badge bg-warning text-dark">
                                ⭐ {restaurant.rating || '4.5'}
                              </span>
                              <span className="badge bg-info">
                                {restaurant.price_range || '$$'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items Grid */}
                      <div className="row g-4">
                        {restaurantMenu.map(item => (
                          <div key={item.id} className="col-lg-6 col-xl-4">
                            <div className="card h-100 menu-item-fullscreen-card">
                              <div className="position-relative">
                                <img 
                                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop'}
                                  className="card-img-top" 
                                  alt={item.name}
                                  style={{ height: '200px', objectFit: 'cover' }}
                                />
                                {/* Price overlay */}
                                <div className="position-absolute top-0 end-0 m-2">
                                  <span className="badge bg-success fs-6 px-3 py-2">
                                    ${parseFloat(item.price).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="card-body d-flex flex-column">
                                <h6 className="card-title fw-bold mb-2">{item.name}</h6>
                                <p className="card-text text-muted small mb-3 flex-grow-1">{item.description}</p>
                                
                                {/* Dietary Tags and Info */}
                                <div className="mb-3">
                                  <div className="d-flex flex-wrap gap-1 mb-2">
                                    {item.is_vegetarian && (
                                      <span className="badge bg-success">🌱 Vegetarian</span>
                                    )}
                                    {item.is_vegan && (
                                      <span className="badge bg-success">🌿 Vegan</span>
                                    )}
                                    {item.is_gluten_free && (
                                      <span className="badge bg-info">🌾 Gluten-Free</span>
                                    )}
                                    {item.spice_level > 0 && (
                                      <span className="badge bg-warning text-dark">
                                        {'🌶️'.repeat(Math.min(item.spice_level, 4))}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {item.prep_time && (
                                    <small className="text-muted">
                                      ⏱️ Ready in {item.prep_time} minutes
                                    </small>
                                  )}
                                </div>
                                
                                {/* Quantity Selector and Add to Cart */}
                                {item.is_available ? (
                                  <div>
                                    <div className="row g-2 mb-2">
                                      <div className="col-5">
                                        <label className="form-label small">Quantity</label>
                                        <div className="input-group input-group-sm">
                                          <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => updateItemQuantity(item.id, getItemQuantity(item.id) - 1)}
                                            disabled={getItemQuantity(item.id) <= 1}
                                          >
                                            −
                                          </button>
                                          <input 
                                            type="number" 
                                            className="form-control text-center"
                                            value={getItemQuantity(item.id)}
                                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                            min="1"
                                            max="99"
                                          />
                                          <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => updateItemQuantity(item.id, getItemQuantity(item.id) + 1)}
                                            disabled={getItemQuantity(item.id) >= 99}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div className="col-7">
                                        <label className="form-label small">Total</label>
                                        <div className="fw-bold text-success fs-6">
                                          ${(parseFloat(item.price) * getItemQuantity(item.id)).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                    <button 
                                      className={`btn w-100 ${addingToCart === item.id ? 'btn-success' : 'btn-primary'}`}
                                      onClick={() => addItemToCart(item, getItemQuantity(item.id))}
                                      disabled={addingToCart === item.id}
                                      style={{ 
                                        transition: 'all 0.3s ease',
                                        transform: addingToCart === item.id ? 'scale(0.95)' : 'scale(1)'
                                      }}
                                    >
                                      {addingToCart === item.id ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                          Adding...
                                        </>
                                      ) : (
                                        <>🛒 Add {getItemQuantity(item.id)} to Cart</>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    className="btn w-100 btn-secondary"
                                    disabled={true}
                                  >
                                    Currently Unavailable
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="fas fa-utensils fa-3x text-muted"></i>
                      </div>
                      <h4 className="text-muted mb-3">No menu items available</h4>
                      <p className="text-muted">This restaurant hasn't added their menu yet.</p>
                      <p className="small text-muted">Please check back later or contact the restaurant directly.</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-light border-top-0 p-4">
                  <div className="container-fluid">
                    <div className="row align-items-center">
                      <div className="col-md-4">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <span className="badge bg-primary fs-6 px-3 py-2">
                              {restaurantMenu.length} item{restaurantMenu.length !== 1 ? 's' : ''} available
                            </span>
                          </div>
                        </div>
                        <small className="text-muted">
                          📍 {restaurant.address}
                        </small>
                      </div>
                      
                      {/* Cart Progress Indicator */}
                      <div className="col-md-4 text-center">
                        {getCartItemCount() > 0 && (
                          <div className="cart-progress-indicator">
                            <div className="d-flex align-items-center justify-content-center mb-1">
                              <span className="badge bg-success fs-6 me-2">
                                🛒 {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''}
                              </span>
                              <span className="fw-bold text-success">
                                ${getCartTotal().toFixed(2)}
                              </span>
                            </div>
                            <Link 
                              to="/cart"
                              className="btn btn-success btn-sm"
                              onClick={closeMenuModal}
                            >
                              View Cart →
                            </Link>
                          </div>
                        )}
                      </div>
                      
                      <div className="col-md-4 text-end">
                        <button 
                          type="button" 
                          className="btn btn-outline-primary me-3" 
                          onClick={() => {
                            closeMenuModal();
                            navigate(`/menu?restaurant=${encodeURIComponent(restaurant.name)}`);
                          }}
                        >
                          📋 Full Menu
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-light border border-2" 
                          onClick={closeMenuModal}
                          style={{
                            color: '#333',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      </div>
    </div>
  );
};

// Home page component
const Home = () => {
  const { restaurants, setRestaurants, setMenuItems, loading, setLoading, error, setError, API_BASE_URL } = useApp();
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      // Load restaurants
      const restaurantsResponse = await axios.get(`${API_BASE_URL}/restaurants/restaurants/`);
      // Handle paginated response
      const restaurantsData = restaurantsResponse.data.results || restaurantsResponse.data;
      setRestaurants(restaurantsData);
      
      // Load menu items
      try {
        const menuResponse = await axios.get(`${API_BASE_URL}/restaurants/menu-items/`);
        // Handle paginated response
        const menuData = menuResponse.data.results || menuResponse.data;
        setMenuItems(menuData);
      } catch (menuError) {
        setMenuItems([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restaurants && restaurants.length > 0) {
      setFilteredRestaurants(restaurants);
    } else {
      setFilteredRestaurants([]);
    }
  }, [restaurants]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredRestaurants(restaurants || []);
      return;
    }

    if (!restaurants || restaurants.length === 0) {
      setFilteredRestaurants([]);
      return;
    }

    const filtered = restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  };

  const handleFilter = (filterType, value) => {
    if (!value) {
      setFilteredRestaurants(restaurants || []);
      return;
    }

    if (!restaurants || restaurants.length === 0) {
      setFilteredRestaurants([]);
      return;
    }

    let filtered = [];
    
    if (filterType === 'cuisine') {
      filtered = restaurants.filter(restaurant =>
        restaurant.cuisine_type.toLowerCase().includes(value.toLowerCase())
      );
    } else if (filterType === 'price') {
      // Implement price filtering logic based on your price range system
      filtered = restaurants.filter(restaurant => {
        const price = restaurant.price_range || '$$';
        if (value === 'budget') return price === '$';
        if (value === 'moderate') return price === '$$';
        if (value === 'expensive') return price === '$$$';
        return true;
      });
    }
    
    setFilteredRestaurants(filtered || []);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        {/* Hero Section */}
        <div className="jumbotron bg-primary text-white p-5 rounded mb-4">
          <h1 className="display-4">Welcome to The Restaurant</h1>
          <p className="lead">Discover amazing restaurants and order your favorite dishes</p>
          <button className="btn btn-warning btn-lg" disabled>
            Explore Restaurants 🍽️
          </button>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter onSearch={() => {}} onFilter={() => {}} />

        {/* Loading Skeletons */}
        <div className="row">
          <div className="col-12 mb-3">
            <h2>Loading Restaurants...</h2>
          </div>
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Hero Section */}
      <div className="jumbotron bg-primary text-white p-5 rounded mb-4">
        <h1 className="display-4">Welcome to The Restaurant</h1>
        <p className="lead">Discover amazing restaurants and order your favorite dishes</p>
        <button 
          className="btn btn-warning btn-lg"
          onClick={() => navigate('/restaurants')}
        >
          Explore Restaurants 🍽️
        </button>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />

      {/* Error Handling */}
      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
            <div>
              <strong>Oops! Something went wrong</strong>
              <div>{error}</div>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
          <div className="mt-2">
            <button 
              className="btn btn-outline-danger btn-sm me-2"
              onClick={loadData}
            >
              🔄 Try Again
            </button>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Restaurants Grid */}
      <div className="row">
        <div className="col-12 mb-3">
          <h2>Featured Restaurants ({filteredRestaurants.length})</h2>
        </div>
        
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => {
            return (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant}
                showMenu={true}
              />
            );
          })
        ) : (
          <div className="col-12 text-center py-5">
            <h3 className="text-muted">No restaurants found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Restaurants page component
const RestaurantsPage = () => {
  const { restaurants, loading, setRestaurants, setLoading, setError, API_BASE_URL, menuItems, setMenuItems } = useApp();

  // Load restaurants if they haven't been loaded yet
  const loadRestaurants = async () => {
    if (restaurants && restaurants.length > 0) {
      return;
    }
    
    setLoading(true);
    try {
      const restaurantsResponse = await axios.get(`${API_BASE_URL}/restaurants/restaurants/`);
      const restaurantsData = restaurantsResponse.data.results || restaurantsResponse.data;
      setRestaurants(restaurantsData);
      setError(null);
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // Load menu items if they haven't been loaded yet
  const loadMenuItems = async () => {
    if (menuItems && menuItems.length > 0) {
      return;
    }
    
    try {
      const menuResponse = await axios.get(`${API_BASE_URL}/restaurants/menu-items/`);
      const menuData = menuResponse.data.results || menuResponse.data;
      setMenuItems(menuData);
    } catch (menuError) {
      setMenuItems([]);
    }
  };

  // Load both restaurants and menu items on mount if not available
  React.useEffect(() => {
    loadRestaurants();
    loadMenuItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading amazing restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>🏪 All Restaurants</h1>
          <p className="lead text-muted">Discover our partner restaurants and their specialties</p>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={() => {
            loadRestaurants();
            loadMenuItems();
          }}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>
      
      {restaurants.length > 0 ? (
        <div className="row">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} showMenu={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <h3 className="text-muted">No restaurants found</h3>
          <p>Please try refreshing the page or check back later.</p>
          <button className="btn btn-primary" onClick={() => {
            loadRestaurants();
            loadMenuItems();
          }}>
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced Menu Item Card Component
const MenuItemCard = ({ item, onAddToCart }) => {
  const getSpiceLevel = (level) => {
    const spices = ['🌶️', '🌶️🌶️', '🌶️🌶️🌶️', '🌶️🌶️🌶️🌶️'];
    return level > 0 ? spices[level - 1] || '🌶️🌶️🌶️🌶️' : '';
  };

  const getDietaryTags = (item) => {
    const tags = [];
    if (item.is_vegetarian) tags.push({ label: '🌱 Vegetarian', class: 'success' });
    if (item.is_vegan) tags.push({ label: '🌿 Vegan', class: 'success' });
    if (item.is_gluten_free) tags.push({ label: '🌾 Gluten-Free', class: 'info' });
    return tags;
  };

  const getMenuItemImage = (item) => {
    if (item.image) return item.image;
    
    // Default food images based on name/ingredients
    const itemName = item.name.toLowerCase();
    if (itemName.includes('pasta') || itemName.includes('spaghetti') || itemName.includes('penne')) {
      return 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop';
    }
    if (itemName.includes('sushi') || itemName.includes('roll')) {
      return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop';
    }
    if (itemName.includes('bowl') || itemName.includes('buddha')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop';
    }
    if (itemName.includes('smoothie') || itemName.includes('juice')) {
      return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=200&fit=crop';
    }
    if (itemName.includes('bruschetta') || itemName.includes('calamari')) {
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop';
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm menu-item-card">
        <img 
          src={getMenuItemImage(item)} 
          className="card-img-top"
          alt={item.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">{item.name}</h5>
            {item.restaurant_name && (
              <small className="badge bg-secondary">{item.restaurant_name}</small>
            )}
          </div>
          <p className="card-text text-muted small flex-grow-1">{item.description}</p>
          
          {/* Dietary Tags */}
          {getDietaryTags(item).length > 0 && (
            <div className="mb-2">
              {getDietaryTags(item).map((tag, index) => (
                <span key={index} className={`badge bg-${tag.class} me-1 mb-1`} style={{ fontSize: '0.7em' }}>
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {/* Details Row */}
          <div className="row text-center mb-3">
            <div className="col-4">
              <small className="text-muted">Prep Time</small>
              <div><strong>⏱️ {item.prep_time}m</strong></div>
            </div>
            {item.spice_level > 0 && (
              <div className="col-4">
                <small className="text-muted">Spice</small>
                <div>{getSpiceLevel(item.spice_level)}</div>
              </div>
            )}
            <div className="col-4">
              <small className="text-muted">Available</small>
              <div>{item.is_available ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="mb-2">
              <small className="text-muted">Ingredients:</small>
              <div className="small">
                {item.ingredients.slice(0, 4).map(ingredient => 
                  ingredient.replace(/_/g, ' ')
                ).join(', ')}
                {item.ingredients.length > 4 && '...'}
              </div>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="mt-auto d-flex justify-content-between align-items-center">
            <span className="h5 text-success mb-0">${parseFloat(item.price).toFixed(2)}</span>
            <button 
              className={`btn ${item.is_available ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onAddToCart(item)}
              disabled={!item.is_available}
            >
              {item.is_available ? '🛒 Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Menu Page with Search and Filters
const MenuPage = () => {
  const { menuItems, addToCart, loading, restaurants, setMenuItems, setLoading, setError, API_BASE_URL } = useApp();
  
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'restaurant'

  // Check for URL parameters on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantParam = urlParams.get('restaurant');
    if (restaurantParam) {
      setRestaurantFilter(decodeURIComponent(restaurantParam));
    }
  }, []);

  // Load menu items if they haven't been loaded yet
  const loadMenuItems = async () => {
    if (menuItems && menuItems.length > 0) {
      return;
    }
    
    setLoading(true);
    try {
      const menuResponse = await axios.get(`${API_BASE_URL}/restaurants/menu-items/`);
      const menuData = menuResponse.data.results || menuResponse.data;
      setMenuItems(menuData);
      setError(null);
    } catch (menuError) {
      setError('Failed to load menu items. Please try again.');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load menu items on mount if not available
  useEffect(() => {
    loadMenuItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize filteredItems with menuItems when they load
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems([]);
    }
  }, [menuItems]);

  useEffect(() => {
    if (!menuItems || menuItems.length === 0) {
      setFilteredItems([]);
      return;
    }
    
    let filtered = [...menuItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.restaurant_name && item.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Restaurant filter
    if (restaurantFilter) {
      filtered = filtered.filter(item => 
        item.restaurant_name === restaurantFilter
      );
    }

    // Dietary filter
    if (dietaryFilter) {
      filtered = filtered.filter(item => {
        switch (dietaryFilter) {
          case 'vegetarian': return item.is_vegetarian;
          case 'vegan': return item.is_vegan;
          case 'gluten_free': return item.is_gluten_free;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return parseFloat(a.price) - parseFloat(b.price);
        case 'price_high': return parseFloat(b.price) - parseFloat(a.price);
        case 'prep_time': return a.prep_time - b.prep_time;
        case 'restaurant': return (a.restaurant_name || '').localeCompare(b.restaurant_name || '');
        case 'name': 
        default: return a.name.localeCompare(b.name);
      }
    });

    setFilteredItems(filtered);
  }, [menuItems, searchTerm, dietaryFilter, restaurantFilter, sortBy]);

  // Group items by restaurant for restaurant view
  const groupedByRestaurant = filteredItems.reduce((acc, item) => {
    const restaurant = item.restaurant_name || 'Unknown Restaurant';
    if (!acc[restaurant]) {
      acc[restaurant] = [];
    }
    acc[restaurant].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading delicious menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="display-4">🍽️ Our Menu</h1>
            <p className="lead text-muted">Discover our delicious selection of carefully crafted dishes</p>
          </div>
          <button 
            className="btn btn-outline-primary"
            onClick={loadMenuItems}
            disabled={loading}
          >
            🔄 Refresh Menu
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="input-group">
            <span className="input-group-text">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="col-md-2 mb-3">
          <select 
            className="form-select" 
            value={restaurantFilter} 
            onChange={(e) => setRestaurantFilter(e.target.value)}
          >
            <option value="">All Restaurants</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.name}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-2 mb-3">
          <select 
            className="form-select" 
            value={dietaryFilter} 
            onChange={(e) => setDietaryFilter(e.target.value)}
          >
            <option value="">All Dietary</option>
            <option value="vegetarian">🌱 Vegetarian</option>
            <option value="vegan">🌿 Vegan</option>
            <option value="gluten_free">🌾 Gluten-Free</option>
          </select>
        </div>

        <div className="col-md-2 mb-3">
          <select 
            className="form-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="prep_time">Prep Time</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </div>

        <div className="col-md-2 mb-3">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn btn-outline-primary ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              🔲 Grid
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary ${viewMode === 'restaurant' ? 'active' : ''}`}
              onClick={() => setViewMode('restaurant')}
            >
              🏪 By Restaurant
            </button>
          </div>
        </div>

        <div className="col-md-1 mb-3">
          <div className="text-muted small text-center">
            <strong>{filteredItems.length}</strong><br/>
            <span>items</span>
          </div>
        </div>
      </div>

      {/* Menu Items Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="row">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={addToCart}
              />
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <h3 className="text-muted">No menu items found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      ) : (
        /* Restaurant Grouped View */
        <div>
          {Object.keys(groupedByRestaurant).length > 0 ? (
            Object.keys(groupedByRestaurant).map(restaurantName => (
              <div key={restaurantName} className="menu-section">
                <h3 className="menu-section-title">
                  {restaurantName} ({groupedByRestaurant[restaurantName].length} items)
                </h3>
                <div className="row">
                  {groupedByRestaurant[restaurantName].map(item => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <h3 className="text-muted">No menu items found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Cart page component with improved UX
const CartPage = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, showToast } = useApp();

  const handleRemoveItem = (item) => {
    removeFromCart(item.id);
    showToast(`${item.name} removed from cart`, 'info');
  };

  if (cart.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-shopping-cart fa-3x text-muted"></i>
          </div>
          <h2 className="mb-3">Your cart is empty</h2>
          <p className="lead text-muted mb-4">Add some delicious items to get started!</p>
          <div>
            <Link to="/restaurants" className="btn btn-primary me-2">
              🏪 Browse Restaurants
            </Link>
            <Link to="/menu" className="btn btn-outline-primary">
              📋 View Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1>🛒 Shopping Cart</h1>
            <span className="badge bg-primary fs-6 px-3 py-2">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-8">
          {cart.map(item => (
            <div key={item.id} className="card mb-3 cart-item">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-2">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                      alt={item.name}
                      className="img-fluid rounded"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-md-4">
                    <h6 className="mb-1">{item.name}</h6>
                    <p className="text-muted small mb-1">{item.description}</p>
                    {item.restaurant_name && (
                      <small className="text-primary">📍 {item.restaurant_name}</small>
                    )}
                  </div>
                  <div className="col-md-2 text-center">
                    <div className="fw-bold text-success">
                      ${parseFloat(item.price).toFixed(2)}
                    </div>
                    <small className="text-muted">each</small>
                  </div>
                  <div className="col-md-2">
                    <div className="input-group input-group-sm">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input 
                        type="number" 
                        className="form-control text-center"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value) || 1)}
                        min="1"
                        style={{ maxWidth: '60px' }}
                      />
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2 text-end">
                    <div className="fw-bold mb-2">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveItem(item)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '2rem' }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📋 Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                {cart.map(item => (
                  <div key={item.id} className="d-flex justify-content-between small mb-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Delivery Fee:</span>
                <span>$3.99</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Tax (8.5%):</span>
                <span>${(getCartTotal() * 0.085).toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <strong className="text-success">
                  ${(getCartTotal() + 3.99 + getCartTotal() * 0.085).toFixed(2)}
                </strong>
              </div>
              
              <button className="btn btn-success w-100 mb-2">
                🚀 Proceed to Checkout
              </button>
              
              <Link to="/restaurants" className="btn btn-outline-primary w-100">
                🛍️ Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Forgot Password page component
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { API_BASE_URL, showToast } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/request-password-reset/`, {
        email
      });
      setMessage(response.data.message || 'Password reset instructions have been sent to your email.');
      showToast('Password reset email sent!', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send reset email. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title">🔐 Reset Password</h2>
                <p className="text-muted">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {message && (
                <div className="alert alert-success" role="alert">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    '📧 Send Reset Instructions'
                  )}
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    ← Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login page component
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    userType: 'customer'
  });
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const { setUser, API_BASE_URL, showToast } = useApp();
  const navigate = useNavigate();

  // Handle keyboard events for password reveal buttons
  const handlePasswordRevealKeyDown = (e, toggleFunction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFunction();
    }
  };

  const fetchUserTypes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/auth/user-types/`);
      setUserTypes(response.data.user_types);
    } catch (error) {
      showToast('Failed to load user types', 'error');
    }
  }, [API_BASE_URL, showToast]);

  // Load user types on component mount
  useEffect(() => {
    fetchUserTypes();
  }, [fetchUserTypes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isLogin) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
    } else {
      if (!formData.username) newErrors.username = 'Username is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.passwordConfirm) newErrors.passwordConfirm = 'Please confirm your password';
      if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Passwords do not match';
      }
      if (!formData.userType) newErrors.userType = 'Please select a user type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/check-email/`, {
        email
      });
      return response.data.available;
    } catch (error) {
      return true; // Assume available if check fails
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/check-username/`, {
        username
      });
      return response.data.available;
    } catch (error) {
      return true; // Assume available if check fails
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/login/`, {
        username: formData.email, // Use email as username for login
        password: formData.password
      });
      
      // Store token
      localStorage.setItem('authToken', response.data.token);
      
      // Set user in context
      setUser(response.data.user);
      
      showToast(response.data.message || 'Login successful!', 'success');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Login failed. Please check your credentials.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check email and username availability
    const emailAvailable = await checkEmailAvailability(formData.email);
    const usernameAvailable = await checkUsernameAvailability(formData.username);

    if (!emailAvailable) {
      setErrors(prev => ({ ...prev, email: 'Email is already registered' }));
      return;
    }
    if (!usernameAvailable) {
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/register/`, {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        user_type: formData.userType,
        password: formData.password,
        password_confirm: formData.passwordConfirm
      });
      
      // Store token
      localStorage.setItem('authToken', response.data.token);
      
      // Set user in context
      setUser(response.data.user);
      
      showToast(response.data.message || 'Registration successful!', 'success');
      navigate('/');
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        // Handle field-specific errors
        const newErrors = {};
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            newErrors[field] = errorData[field][0];
          } else if (typeof errorData[field] === 'string') {
            newErrors[field] = errorData[field];
          }
        });
        setErrors(newErrors);
      } else {
        showToast('Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      userType: 'customer'
    });
    setErrors({});
    setSuccessMessage('');
    setShowPassword(false);
    setShowPasswordConfirm(false);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow auth-card">
            <div className="card-body p-4 auth-form-container">
              <div className="text-center mb-4">
                <h2 className="card-title">
                  {isLogin ? '🔐 Login' : '👤 Create Account'}
                </h2>
                <p className="text-muted">
                  {isLogin 
                    ? 'Welcome back! Please sign in to your account.' 
                    : 'Join our platform and start your journey!'
                  }
                </p>
              </div>

              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}

              <form onSubmit={isLogin ? handleLogin : handleRegister}>
                {!isLogin && (
                  <>
                    {/* User Type Selection */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">I want to join as:</label>
                      <select
                        name="userType"
                        className={`form-select ${errors.userType ? 'is-invalid' : ''}`}
                        value={formData.userType}
                        onChange={handleInputChange}
                      >
                        {userTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.userType && <div className="invalid-feedback">{errors.userType}</div>}
                      {formData.userType && (
                        <div className="form-text">
                          {userTypes.find(t => t.value === formData.userType)?.description}
                        </div>
                      )}
                    </div>

                    {/* Name Fields */}
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                          {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                          {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Username */}
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Choose a unique username"
                      />
                      {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-control"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                    />
                  </div>
                )}

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={isLogin ? "Enter your password" : "Minimum 8 characters"}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary password-reveal-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      onKeyDown={(e) => handlePasswordRevealKeyDown(e, () => setShowPassword(!showPassword))}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex="0"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-group">
                      <input
                        type={showPasswordConfirm ? "text" : "password"}
                        name="passwordConfirm"
                        className={`form-control ${errors.passwordConfirm ? 'is-invalid' : ''}`}
                        value={formData.passwordConfirm}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary password-reveal-btn"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        onKeyDown={(e) => handlePasswordRevealKeyDown(e, () => setShowPasswordConfirm(!showPasswordConfirm))}
                        aria-label={showPasswordConfirm ? "Hide password confirmation" : "Show password confirmation"}
                        title={showPasswordConfirm ? "Hide password confirmation" : "Show password confirmation"}
                        tabIndex="0"
                      >
                        {showPasswordConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.passwordConfirm && <div className="invalid-feedback d-block">{errors.passwordConfirm}</div>}
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className={`btn ${isLogin ? 'btn-primary' : 'btn-success'} w-100 mb-3`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    isLogin ? '🔐 Sign In' : '🎉 Create Account'
                  )}
                </button>

                {/* Switch Mode */}
                <div className="text-center">
                  <p className="mb-0">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={switchMode}
                    >
                      {isLogin ? 'Create one here' : 'Sign in instead'}
                    </button>
                  </p>
                </div>

                {isLogin && (
                  <div className="text-center mt-3">
                    <Link to="/forgot-password" className="text-muted small">
                      Forgot your password?
                    </Link>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* User Type Info */}
          {!isLogin && (
            <div className="card mt-3">
              <div className="card-body">
                <h6 className="card-title">👥 Choose Your Role</h6>
                <div className="row">
                  <div className="col-12">
                    <small className="text-muted">
                      <strong>👨‍🍳 Vendor:</strong> Manage restaurants and menus<br/>
                      <strong>🚗 Delivery:</strong> Deliver orders and earn money<br/>
                      <strong>👥 Staff:</strong> Work in restaurants<br/>
                      <strong>🛍️ Customer:</strong> Order food and enjoy meals
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Floating cart button component
const FloatingCartButton = () => {
  const { getCartItemCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on cart page
  if (location.pathname === '/cart') return null;
  
  // Don't show if cart is empty
  if (getCartItemCount() === 0) return null;
  
  return (
    <button
      className="btn btn-warning rounded-circle position-fixed shadow-lg floating-cart-btn"
      style={{
        bottom: '2rem',
        right: '2rem',
        width: '60px',
        height: '60px',
        zIndex: 1000
      }}
      onClick={() => navigate('/cart')}
      aria-label={`View cart with ${getCartItemCount()} items`}
    >
      <div className="position-relative">
        🛒
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {getCartItemCount()}
        </span>
      </div>
    </button>
  );
};

// Main App component with floating cart button
function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App min-vh-100 bg-light">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Routes>
          </main>
          
          {/* Floating Cart Button */}
          <FloatingCartButton />
          
          {/* Footer */}
          <footer className="bg-dark text-white text-center py-3 mt-5">
            <div className="container">
              <p>&copy; 2024 The Restaurant. Built with React & Django.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;