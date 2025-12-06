import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Simple checkout placeholder page
const CheckoutPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body text-center p-4">
              <h2 className="mb-3">Checkout</h2>
              <p className="text-muted mb-4">Checkout flow coming soon.</p>
              <button className="btn btn-primary me-2" onClick={() => navigate('/cart')}>Back to Cart</button>
              <Link to="/restaurants" className="btn btn-outline-secondary">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheckoutPage;