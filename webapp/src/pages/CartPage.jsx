import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import formatCurrency from '../utils/formatCurrency';
const CartPage = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const deliveryFee = 3.99;
  const taxRate = 0.085;
  const subtotal = getCartTotal();
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  const clearCart = () => {
    cart.forEach(i => removeFromCart(i.id));
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="mb-3" aria-label="Shopping Cart">🛒 Your Cart</h1>
        <p className="lead text-muted mb-4">No items yet. Discover something tasty.</p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/restaurants" className="btn btn-primary">Browse Restaurants</Link>
          <Link to="/menu" className="btn btn-outline-primary">View Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h3 mb-0" aria-label="Shopping Cart">🛒 Your Cart</h1>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary" aria-label={`Cart has ${cart.length} item${cart.length !== 1 ? 's' : ''}`}>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={clearCart}
                aria-label="Clear all items from cart"
                title="Clear all items"
                data-testid="cart-clear-btn"
              >Clear</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col" style={{width:'60px'}} aria-label="Item image" />
                  <th scope="col">Item</th>
                  <th scope="col" className="text-center" style={{width:'110px'}}>Price (each)</th>
                  <th scope="col" className="text-center" style={{width:'150px'}}>Quantity</th>
                  <th scope="col" className="text-end" style={{width:'120px'}}>Line Total</th>
                  <th scope="col" className="text-end" style={{width:'80px'}} aria-label="Remove" />
                </tr>
              </thead>
              <tbody>
                {cart.map(item => {
                  const lineTotal = parseFloat(item.price) * item.quantity;
                  return (
                    <tr
                      key={item.id}
                      className="cart-row"
                      aria-label={`Cart item ${item.name}, quantity ${item.quantity}, total ${formatCurrency(lineTotal)}`}
                    >
                      <td>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                          alt={item.name}
                          className="rounded" style={{width:'50px',height:'50px',objectFit:'cover'}} />
                      </td>
                      <td>
                        <div className="fw-semibold">{item.name}</div>
                        {item.restaurant_name && (
                          <div className="small text-muted">{item.restaurant_name}</div>
                        )}
                        <div className="small text-muted">{formatCurrency(item.price)} each</div>
                      </td>
                      <td className="text-center text-success">{formatCurrency(item.price)}</td>
                      <td>
                        <div className="input-group input-group-sm justify-content-center">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            title={`Decrease quantity of ${item.name}`}
                            data-testid={`cart-decrease-${item.id}`}
                            style={item.quantity <= 1 ? { opacity:0.45, color:'#6c757d' } : undefined}
                          >−</button>
                          <input
                            type="number"
                            className="form-control text-center cart-qty-input"
                            value={item.quantity}
                            min={1}
                            max={99}
                            onChange={(e) => {
                              const parsed = parseInt(e.target.value, 10);
                              const next = Math.max(1, Math.min(99, isNaN(parsed) ? 1 : parsed));
                              updateCartQuantity(item.id, next);
                            }}
                            onBlur={(e) => {
                              const parsed = parseInt(e.target.value, 10);
                              const next = Math.max(1, Math.min(99, isNaN(parsed) ? 1 : parsed));
                              if (next !== item.quantity) updateCartQuantity(item.id, next);
                            }}
                            style={{maxWidth:'60px'}}
                            aria-label={`Quantity of ${item.name}`}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            title={`Increase quantity of ${item.name}`}
                            data-testid={`cart-increase-${item.id}`}
                          >+</button>
                        </div>
                      </td>
                      <td className="text-end fw-semibold">{formatCurrency(lineTotal)}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          title={`Remove ${item.name}`}
                          data-testid={`cart-remove-${item.id}`}
                        >✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm position-sticky" style={{top:'1rem'}}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label small">Promo Code</label>
                <div className="input-group input-group-sm">
                  <input type="text" className="form-control" placeholder="Enter code" aria-label="Enter promo code" />
                  <button className="btn btn-outline-secondary" disabled aria-disabled="true">Apply</button>
                </div>
              </div>
              <ul className="list-unstyled mb-3 small" aria-label="Items summary">
                {cart.map(item => (
                  <li key={item.id} className="d-flex justify-content-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <hr />
              <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="d-flex justify-content-between mb-2"><span>Delivery</span><span>{formatCurrency(deliveryFee)}</span></div>
              <div className="d-flex justify-content-between mb-2"><span>Tax (8.5%)</span><span>{formatCurrency(tax)}</span></div>
              <hr />
              <div className="d-flex justify-content-between mb-3 fw-bold"><span>Total</span><span className="text-success">{formatCurrency(total)}</span></div>
              <button
                className="btn btn-success w-100 mb-2"
                onClick={() => navigate('/checkout')}
                disabled={cart.length === 0}
                aria-label="Proceed to checkout"
                data-testid="cart-checkout-btn"
              >Proceed to Checkout</button>
              <Link to="/restaurants" className="btn btn-outline-primary w-100" data-testid="cart-continue-btn">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CartPage;