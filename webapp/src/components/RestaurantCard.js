import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../App';
import RestaurantFormModal from './RestaurantFormModal';
import axios from 'axios';


const RestaurantCard = ({ restaurant, onUpdate }) => {
  const { user, API_BASE_URL } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = restaurant.is_owner || (user && user.user_type === 'platform_admin');
  
  // // Debug: log restaurant data to console
  // console.log('Restaurant data:', restaurant);
  
  const imageSrc = restaurant.image 
    || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center';

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `${API_BASE_URL}/restaurants/${restaurant.slug}/`,
        {
          headers: {
            'Authorization': `Token ${token}`
          }
        }
      );
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Failed to delete restaurant: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeleting(false);
    }
  };
  
  // Helper to render graphical stars
  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (rounded >= i) {
        stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
      } else if (rounded >= i - 0.5) {
        stars.push(<i key={i} className="bi bi-star-half text-warning"></i>);
      } else {
        stars.push(<i key={i} className="bi bi-star text-warning"></i>);
      }
    }
    return stars;
  };

  return (
    <div className="card mb-3">
      <img src={imageSrc}
        alt={restaurant.name}
        className="card-img-top mb-3"
        style={{objectFit:'cover',height:'480px'}}
      />
      <div className="card-body">
        <h5 className="card-title"
        >
          {restaurant.name} 
          <span className="badge bg-primary ms-3">
            {restaurant.cuisine_type}
          </span>
        </h5>
        <p className="card-text mb-1"
        >
          {restaurant.description}
        </p>
        <div className="mb-2"
        >
          Price Range:  &nbsp;
          <span className="badge bg-info text-dark"
          >
            {restaurant.price_range}
          </span>
        </div>
        <div className="mb-2">
          Rating : <span className="me-2"
          >
            {
              renderStars(Number(restaurant.rating))
            }
          </span>
        </div>
        
        {
          restaurant.features && restaurant.features.length > 0 && (
            <div className="mt-2">
              {
                restaurant.features.map(
                  (feature, idx) => (
                    <span key={idx} 
                      className="badge bg-secondary me-1"
                    >
                      {feature}
                    </span>
                  )
                )
              }
            </div>
          )
        }
        <div className="mt-3 d-flex gap-2">
          <Link to={`/restaurants/${restaurant.slug}`} 
            className="btn btn-outline-primary flex-grow-1"
          >
            View Details
          </Link>
          <Link to={`/restaurants/${restaurant.slug}/menu`} 
            className="btn btn-outline-success flex-grow-1"
          >
            View Menu
          </Link>
        </div>

        {canEdit && (
          <div className="mt-2 d-flex gap-2">
            <button
              className="btn btn-sm btn-warning flex-grow-1"
              onClick={() => setShowEditModal(true)}
            >
              <i className="bi bi-pencil"></i> Edit
            </button>
            <button
              className="btn btn-sm btn-danger flex-grow-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              <i className="bi bi-trash"></i> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <RestaurantFormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        restaurant={restaurant}
        onSuccess={() => {
          setShowEditModal(false);
          if (onUpdate) onUpdate();
        }}
      />
    </div>
  );
};

export default RestaurantCard;
