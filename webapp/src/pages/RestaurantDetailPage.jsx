import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../App';

const Inner = () => {
  const { slug } = useParams();
  const { API_BASE_URL, showToast } = useApp();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
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
        setReviews(res.data?.recent_reviews || []);
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

  const renderStars = (value) => {
    const v = Math.round((value || 0) * 2) / 2; // to halves
    return (
      <span aria-label={`Rating ${v} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= v;
          const half = !filled && i + 0.5 === v;
          return (
            <span key={i} title={`${v}/5`} style={{ color: '#f5a623', marginRight: 2 }}>
              {filled ? '★' : half ? '⯨' : '☆'}
            </span>
          );
        })}
      </span>
    );
  };

  const loadAllReviews = async () => {
    try {
      setReviewsError(null);
      setReviewsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/restaurants/${slug}/reviews/`);
      setReviews(res.data || []);
    } catch (e) {
      setReviewsError('Could not load reviews');
    } finally {
      setReviewsLoading(false);
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

      {/* Reviews Section */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Customer Reviews</h5>
            <div className="text-nowrap">
              {renderStars(restaurant.average_rating)}
              <span className="ms-2 text-muted">{(restaurant.average_rating || 0).toFixed(1)} · {restaurant.total_reviews || 0} reviews</span>
            </div>
          </div>
          {reviewsError && <div className="alert alert-danger py-2">{reviewsError}</div>}
          {reviewsLoading && <div className="text-muted">Loading reviews…</div>}
          {!reviewsLoading && reviews.length === 0 && (
            <div className="text-muted">No reviews yet.</div>
          )}
          <div className="list-group">
            {reviews.map((r) => (
              <div key={r.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-semibold">{r.user_name || r.user || 'Anonymous'}</div>
                  <div>{renderStars(r.rating)}</div>
                </div>
                {r.comment && <p className="mb-2 mt-2">{r.comment}</p>}
                {Array.isArray(r.images) && r.images.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {r.images.map((url, idx) => (
                      <a href={url} key={idx} target="_blank" rel="noreferrer">
                        <img src={url} alt="review" style={{ maxHeight: 90, borderRadius: 6 }} />
                      </a>
                    ))}
                  </div>
                )}
                <div className="text-muted small mt-2">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
          {(restaurant.total_reviews || 0) > reviews.length && (
            <button className="btn btn-outline-primary mt-3" onClick={loadAllReviews} disabled={reviewsLoading}>
              {reviewsLoading ? 'Loading…' : `View all ${restaurant.total_reviews} reviews`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function RestaurantDetailPage() {
  return <Inner />;
}
