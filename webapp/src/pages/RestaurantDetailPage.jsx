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

      {/* Main Restaurant Info Card */}
      <div className="card shadow-sm mb-4">
        <img 
          src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'} 
          alt={restaurant.name} 
          className="card-img-top" 
          style={{ height: '400px', objectFit: 'cover' }}
        />
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h2 className="card-title">{restaurant.name}</h2>
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="badge bg-primary">{restaurant.cuisine_type}</span>
                <span className="badge bg-info text-dark">{restaurant.price_range}</span>
                <div className="d-flex align-items-center">
                  {renderStars(restaurant.rating)}
                  <span className="ms-2 text-muted">
                    {Number(restaurant.rating || 0).toFixed(1)} ({restaurant.total_reviews || 0} reviews)
                  </span>
                </div>
              </div>
              <p className="text-muted">{restaurant.description}</p>
            </div>
            <div className="col-md-4">
              <Link 
                className="btn btn-primary w-100 mb-3" 
                to={`/restaurants/${restaurant.slug}/menu`} 
                data-testid="restaurant-detail-browse-menu"
              >
                🍽️ Browse Menu
              </Link>
              {restaurant.is_active ? (
                <span className="badge bg-success w-100">✅ Currently Open</span>
              ) : (
                <span className="badge bg-secondary w-100">🔒 Closed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Details Grid */}
      <div className="row mb-4">
        {/* Contact & Location */}
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">📍 Location & Contact</h5>
              <div className="mb-3">
                <strong>Address:</strong>
                <p className="mb-0">{restaurant.address}</p>
              </div>
              {restaurant.phone_number && (
                <div className="mb-3">
                  <strong>📞 Phone:</strong>
                  <p className="mb-0">
                    <a href={`tel:${restaurant.phone_number}`}>{restaurant.phone_number}</a>
                  </p>
                </div>
              )}
              {restaurant.email && (
                <div className="mb-3">
                  <strong>📧 Email:</strong>
                  <p className="mb-0">
                    <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
                  </p>
                </div>
              )}
              {restaurant.website && (
                <div className="mb-3">
                  <strong>🌐 Website:</strong>
                  <p className="mb-0">
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                      {restaurant.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery & Order Info */}
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">🚚 Delivery Information</h5>
              <div className="mb-3">
                <strong>Delivery Time:</strong>
                <p className="mb-0">⏱️ {restaurant.delivery_time || '30-45 min'}</p>
              </div>
              <div className="mb-3">
                <strong>Delivery Fee:</strong>
                <p className="mb-0">💵 GHC {restaurant.delivery_fee || '2.99'}</p>
              </div>
              <div className="mb-3">
                <strong>Minimum Order:</strong>
                <p className="mb-0">💰 GHC {restaurant.min_order || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Amenities */}
      {restaurant.features && restaurant.features.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">✨ Features & Amenities</h5>
            <div className="d-flex flex-wrap gap-2">
              {restaurant.features.map((feature, idx) => (
                <span key={idx} className="badge bg-secondary">
                  {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Opening Hours */}
      {restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">🕒 Opening Hours</h5>
            <div className="row">
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                const dayName = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }[day];
                const hours = restaurant.opening_hours[day];
                if (!hours) return null;
                return (
                  <div key={day} className="col-md-6 mb-2">
                    <div className="d-flex justify-content-between">
                      <strong>{dayName}:</strong>
                      <span>
                        {hours.closed ? (
                          <span className="text-danger">Closed</span>
                        ) : hours.open && hours.close ? (
                          `${hours.open} - ${hours.close}`
                        ) : (
                          <span className="text-muted">Hours not set</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Menu Categories Preview */}
      {restaurant.categories && restaurant.categories.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">📋 Menu Categories</h5>
              <Link to={`/restaurants/${restaurant.slug}/menu`} className="btn btn-sm btn-outline-primary">
                View Full Menu →
              </Link>
            </div>
            <div className="row">
              {restaurant.categories.map(category => (
                <div key={category.id} className="col-md-4 mb-3">
                  <div className="border rounded p-3">
                    <h6 className="mb-2">{category.name}</h6>
                    {category.description && (
                      <p className="small text-muted mb-2">{category.description}</p>
                    )}
                    <small className="text-muted">
                      {category.items_count || 0} items
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">⭐ Customer Reviews</h5>
            <div className="text-nowrap">
              {renderStars(restaurant.average_rating)}
              <span className="ms-2 text-muted">{Number(restaurant.average_rating || 0).toFixed(1)} · {restaurant.total_reviews || 0} reviews</span>
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
