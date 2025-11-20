import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});

  // Placeholder toast hook; actual toast managed by AppContext
  // Toast integration placeholder removed (unused)

  const addToCart = (item) => {
    setAddingToCart(item.id);
    const quantityToAdd = item.quantity || 1;
    setCart(currentCart => {
      const existingItem = currentCart.find(ci => ci.id === item.id);
      if (existingItem) {
        return currentCart.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + quantityToAdd } : ci);
      }
      return [...currentCart, { ...item, quantity: quantityToAdd }];
    });
    setShowCartPreview(true);
    setTimeout(() => setShowCartPreview(false), 3000);
    setAddingToCart(null);
    console.log('[CartContext] item added id=', item.id, 'newCount=', getCartItemCount() + quantityToAdd);
  };

  const addItemToCart = (item, quantity = 1) => {
    const itemToAdd = { ...item, quantity: parseInt(quantity) || 1 };
    addToCart(itemToAdd);
    setItemQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    setItemQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const getItemQuantity = (itemId) => itemQuantities[itemId] || 1;

  const removeFromCart = (itemId) => {
    setCart(currentCart => currentCart.filter(ci => ci.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(currentCart => currentCart.map(ci => ci.id === itemId ? { ...ci, quantity } : ci));
    }
  };

  const getCartTotal = () => cart.reduce((t, i) => t + (parseFloat(i.price) * i.quantity), 0);
  const getCartItemCount = () => cart.reduce((t, i) => t + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addingToCart,
      showCartPreview,
      setShowCartPreview,
      addToCart,
      addItemToCart,
      updateItemQuantity,
      getItemQuantity,
      removeFromCart,
      updateCartQuantity,
      getCartTotal,
      getCartItemCount
    }}>
      {children}
      {showCartPreview && cart.length > 0 && (
        <div
          className="position-fixed"
          data-testid="cart-preview"
          style={{ bottom: '20px', right: '20px', zIndex: 1500, animation: 'slideInUp 0.3s ease-out', pointerEvents: 'auto' }}
        >
          <div className="card shadow-lg border-0" style={{ minWidth: '320px', maxWidth: '400px' }}>
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">🛒 Cart Preview</h6>
              <button
                className="btn-close btn-close-white btn-sm"
                onClick={() => setShowCartPreview(false)}
                aria-label="Close cart preview"
                data-testid="cart-preview-close-btn"
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
                  data-testid="cart-preview-view-cart-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCartPreview(false);
                    navigate('/cart');
                  }}
                >
                  View Full Cart →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
