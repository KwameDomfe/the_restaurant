import React from 'react';
import axios from 'axios';
import { useApp } from '../App';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantCardSkeleton from '../components/RestaurantCardSkeleton';
import { Link } from 'react-router-dom';

// Restaurants page component
const RestaurantsPage = () => {
  const { restaurants, setRestaurants, setError, API_BASE_URL, menuItems, setMenuItems, error } = useApp();
  const location = window.location;
  const params = new URLSearchParams(location.search);
  const cuisineFilter = params.get('cuisine');
  const [restaurantsLoading, setRestaurantsLoading] = React.useState(false);
  const [menuLoading, setMenuLoading] = React.useState(false);

  // Load restaurants if they haven't been loaded yet
  const loadRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const restaurantsResponse = await axios.get(`${API_BASE_URL}/restaurants/`);
      const restaurantsData = restaurantsResponse.data.results || restaurantsResponse.data;
      setRestaurants(restaurantsData);
      setError(null);
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  // Load menu items if they haven't been loaded yet
  const loadMenuItems = async () => {
    setMenuLoading(true);
    try {
      const menuResponse = await axios.get(`${API_BASE_URL}/menu-items/`);
      const menuData = menuResponse.data.results || menuResponse.data;
      setMenuItems(menuData);
    } catch (menuError) {
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  // DRY refresh logic
  const handleRefresh = () => {
    loadRestaurants();
    loadMenuItems();
  };

  // Load both restaurants and menu items on mount
  React.useEffect(() => {
    loadRestaurants();
    loadMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (restaurantsLoading || menuLoading) {
    return (
      <div className="container mt-4">
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
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
          <button 
            type="button" 
            className="btn btn-outline-danger mt-2"
            onClick={handleRefresh}
          >🔄 Retry</button>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>🏪 {cuisineFilter ? `${cuisineFilter} Restaurants` : 'All Restaurants'}</h1>
          <p className="lead text-muted">
            {
              cuisineFilter
              ? `Discover our ${cuisineFilter} partner restaurants and their specialties`
              : 'Discover our partner restaurants and their specialties'
            }
          </p>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={handleRefresh}
          disabled={restaurantsLoading || menuLoading}
        >
          🔄 Refresh
        </button>
      </div>
      
      {
        (restaurants.filter(r => !cuisineFilter || r.cuisine_type === cuisineFilter).length > 0) ? (
          <div className="row">
            {
              restaurants
                .filter(r => !cuisineFilter || r.cuisine_type === cuisineFilter)
                .map(
                  restaurant => (
                    <RestaurantCard key={restaurant.id} 
                      restaurant={restaurant} 
                      showMenu={true} 
                    />
                  )
                )
            }
          </div>
        ) : (
          <div className="empty-state" role="status" aria-live="polite">
            <span className="empty-icon" aria-hidden="true">🔎</span>
            <h3 className="text-muted">No restaurants found</h3>
            <p className="mb-3">Please try refreshing, or check back later.</p>
            <div className="empty-actions">
              <button className="btn btn-primary" onClick={handleRefresh}>🔄 Try Again</button>
              <Link to="/" className="btn btn-outline-secondary">🏠 Go Home</Link>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default RestaurantsPage;