import React, { useState, useEffect } from 'react';
import { MenuItemSkeleton } from '../components/SkeletonLoader';
import axios from 'axios';
import { useApp } from '../App';
import MenuItemCard from './MenuItemCard.jsx';
import { useParams } from 'react-router-dom';
// Enhanced Menu Page with Search and Filters

const MenuPage = () => {
  // Separate loading states
  const [menuLoading, setMenuLoading] = useState(false);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);

  // Load restaurants if they haven't been loaded yet
  const loadRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/`);
      const data = response.data.results || response.data;
      setRestaurants(data);
      setError(null);
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  };
  const { menuItems, loading, restaurants, setMenuItems, setLoading, setError, API_BASE_URL, error, setRestaurants } = useApp();
  const { slug } = useParams();
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'restaurant'

  // If on /restaurants/:slug/menu, set restaurantFilter to the restaurant name matching slug
  const [restaurantName, setRestaurantName] = useState('');
  // Ensure restaurant filter is set after both restaurants and menuItems are loaded
  // Set restaurant filter only when both restaurants and menuItems are loaded
  useEffect(() => {
    if (
      slug &&
      restaurants && restaurants.length > 0 &&
      menuItems && menuItems.length > 0
    ) {
      const found = restaurants.find(r => r.slug === slug);
      if (found) {
        setRestaurantFilter(found.name);
        setRestaurantName(found.name);
      } else {
        setRestaurantFilter('');
        setRestaurantName('');
      }
    } else if (!slug) {
      setRestaurantFilter('');
      setRestaurantName('');
    }
  }, [slug, restaurants, menuItems]);

  // Check for URL parameters on component mount (for legacy support)
  React.useEffect(() => {
    if (!slug) {
      const urlParams = new URLSearchParams(window.location.search);
      const restaurantParam = urlParams.get('restaurant');
      if (restaurantParam) {
        setRestaurantFilter(decodeURIComponent(restaurantParam));
      }
    }
  }, [slug]);

  // Load menu items if they haven't been loaded yet
  const loadMenuItems = async () => {
    setMenuLoading(true);
    try {
      const menuResponse = await axios.get(`${API_BASE_URL}/menu-items/`);
      const menuData = menuResponse.data.results || menuResponse.data;
      setMenuItems(menuData);
      setError(null);
    } catch (menuError) {
      setError('Failed to load menu items. Please try again.');
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  // Load menu items and restaurants on mount if not available
  useEffect(() => {
    loadMenuItems();
    loadRestaurants();
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


  // Show skeleton loader until both restaurants and menuItems are loaded
  const isDataLoading = menuLoading || restaurantsLoading || !restaurants || restaurants.length === 0 || !menuItems || menuItems.length === 0;
  if (isDataLoading) {
    // Show skeletons for menu items
    return (
      <div className="container mt-4">
        <div className="row">
          {[...Array(6)].map((_, i) => (
            <MenuItemSkeleton key={i} />
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
              <strong>Failed to load menu</strong>
              <div>{error}</div>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="display-4">
              🍽️ {restaurantName ? `${restaurantName} Menu` : 'Our Menu'}
            </h1>
            <p className="lead text-muted">
              {restaurantName
                ? `Browse the menu for ${restaurantName}`
                : 'Discover our delicious selection of carefully crafted dishes'}
            </p>
          </div>
          <button 
            className="btn btn-outline-primary"
            onClick={() => {
              loadMenuItems();
              loadRestaurants();
            }}
            disabled={
              menuLoading 
              || restaurantsLoading
            }
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
            onChange={(e) => {
              if (!slug) setRestaurantFilter(e.target.value);
            }}
            disabled={!!slug}
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
              />
            ))
          ) : (
            <div className="col-12">
              <div className="empty-state" role="status" aria-live="polite">
                <span className="empty-icon" aria-hidden="true">🍽️</span>
                <h3 className="text-muted">No menu items found</h3>
                <p className="mb-3">Try adjusting your search or filters.</p>
                <div className="empty-actions">
                  <button className="btn btn-outline-primary" onClick={() => setSearchTerm('')}>Clear Search</button>
                  <button className="btn btn-outline-secondary" onClick={() => { setDietaryFilter(''); setRestaurantFilter(''); }}>Reset Filters</button>
                </div>
              </div>
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
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" role="status" aria-live="polite">
              <span className="empty-icon" aria-hidden="true">🍽️</span>
              <h3 className="text-muted">No menu items found</h3>
              <p className="mb-3">Try adjusting your search or filters.</p>
              <div className="empty-actions">
                <button className="btn btn-outline-primary" onClick={() => setSearchTerm('')}>Clear Search</button>
                <button className="btn btn-outline-secondary" onClick={() => { setDietaryFilter(''); setRestaurantFilter(''); }}>Reset Filters</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuPage;