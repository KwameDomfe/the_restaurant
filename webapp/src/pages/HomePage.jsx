import { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../App';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantCardSkeleton from '../components/RestaurantCardSkeleton';
import { Link } from 'react-router-dom';
import SelectedRestaurants from '../components/homePage/SelectedRestaurants';
import SelectedRestaurantsSkeleton from '../components/homePage/SelectedRestaurantsSkeleton';
import Cuisines from '../components/homePage/Cuisines';
import CuisinesSkeleton from '../components/homePage/CuisinesSkeleton';
import MenuCategories from '../components/homePage/MenuCategories';
import MenuCategoriesSkeleton from '../components/homePage/MenuCategoriesSkeleton';

// Restaurants page component
const HomePage = () => {
  const { restaurants, loading, setRestaurants, setLoading, setError, API_BASE_URL, menuItems, setMenuItems, error } = useApp();
  const [popularCuisines, setPopularCuisines] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  // Load menu categories from backend
  const loadMenuCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/`);
      setMenuCategories(response.data.results || response.data);
    } catch (err) {
      setMenuCategories([]);
    }
  };

  // Load restaurants if they haven't been loaded yet
  const loadRestaurants = async () => {
    if (restaurants && restaurants.length > 0) {
      return;
    }
    
    setLoading(true);
    try {
      const restaurantsResponse = await axios.get(`${API_BASE_URL}/restaurants/`);
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
      const menuResponse = await axios.get(`${API_BASE_URL}/menu-items/`);
      const menuData = menuResponse.data.results || menuResponse.data;
      setMenuItems(menuData);
    } catch (menuError) {
      setMenuItems([]);
    }
  };

  // Load popular cuisines from backend
  const loadPopularCuisines = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/popular-cuisines/`);
      setPopularCuisines(response.data);
    } catch (err) {
      setPopularCuisines([]);
    }
  };

  // DRY refresh logic
  const handleRefresh = () => {
    loadRestaurants();
    loadMenuItems();
    loadPopularCuisines();
    loadMenuCategories();
  };

  // Load both restaurants and menu items on mount if not available
  useEffect(() => {
    loadRestaurants();
    loadMenuItems();
    loadPopularCuisines();
    loadMenuCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        {/* Header Skeleton */}
        <div className="mb-4">
          <div className="skeleton-page-title mb-2" 
            style={{height:'36px',width:'250px'}}
          >
          </div>
          <div className="skeleton-text mb-2" 
            style={{height:'16px',width:'60%'}}
          >
          </div>
        </div>
        {/* Restaurants Skeleton */}
        <SelectedRestaurantsSkeleton />
        {/* Cuisines Skeleton */}
        <CuisinesSkeleton />
        {/* Menu Categories Skeleton */}
        <MenuCategoriesSkeleton />
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
          <h1>🏪 All Restaurants</h1>
          <p className="lead text-muted">Discover our partner restaurants and their specialties</p>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={handleRefresh}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Restaurants Section */}
      <SelectedRestaurants 
        restaurants={restaurants} 
        handleRefresh={handleRefresh} 
        />

      {/* Cuisines Section */}
      <Cuisines popularCuisines={popularCuisines} />

      {/* Menu Categories Section */}
      <MenuCategories categories={menuCategories} />
    </div>
    
  );
};

export default HomePage;