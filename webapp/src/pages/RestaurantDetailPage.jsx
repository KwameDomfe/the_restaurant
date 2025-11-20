import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../App';

const Inner = () => {
  const { slug } = useParams();
  const { API_BASE_URL, showToast } = useApp();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/restaurants/${slug}/`);
        if (!mounted) return;
        setRestaurant(res.data);
      } catch (e) {
        if (!mounted) return;
        setError('Could not load restaurant');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [slug, API_BASE_URL]);

  if (loading) return <div className="container py-5"><div className="text-muted">Loading restaurant…</div></div>;
  if (error) return (
    <div className="container py-5">
      <div className="alert alert-danger">{error}</div>
      <Link className="btn btn-secondary" to="/restaurants">Back to restaurants</Link>
    </div>
  );
  if (!restaurant) return (
    <div className="container py-5">
      <div className="text-muted">Restaurant not found</div>
      <Link className="btn btn-secondary" to="/restaurants">Back to restaurants</Link>
    </div>
  );

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      showToast('Link copied to clipboard', 'success');
    } catch (e) {
      showToast('Unable to copy link', 'error');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/restaurants" className="btn btn-outline-secondary" data-testid="restaurant-detail-back">← Back</Link>
        <button type="button" className="btn btn-outline-primary" onClick={handleCopyLink} data-testid="restaurant-detail-copy-link">
          🔗 Copy Link
        </button>
      </div>
      <div className="card shadow-sm">
        <img src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'} alt={restaurant.name} className="card-img-top" />
        <div className="card-body">
          <h3 className="card-title">{restaurant.name}</h3>
          <p className="text-muted mb-2">{restaurant.cuisine_type}</p>
          <p className="mb-3">{restaurant.address}</p>
          <div className="d-flex gap-3 mb-3">
            <span>⏱️ {restaurant.delivery_time || '30-45 min'}</span>
            <span>🚚 {restaurant.delivery_fee ? `GHC ${restaurant.delivery_fee}` : 'GHC 2.99'}</span>
            <span>💰 {restaurant.price_range}</span>
          </div>
          <Link className="btn btn-primary" to="/menu" data-testid="restaurant-detail-browse-menu">Browse Menu</Link>
        </div>
      </div>
    </div>
  );
};

export default function RestaurantDetailPage() {
  return <Inner />;
}
