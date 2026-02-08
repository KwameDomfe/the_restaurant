import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../App';
import axios from 'axios';
import MenuItemCard from './MenuItemCard';
import MenuItemFormModal from '../components/MenuItemFormModal';

export default function ManageRestaurantMenu() {
  const { slug } = useParams();
  const { API_BASE_URL, user } = useApp();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchRestaurantAndMenu = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch restaurant details
      const restaurantResponse = await axios.get(`${API_BASE_URL}/restaurants/${slug}/`);
      setRestaurant(restaurantResponse.data);

      // Fetch menu items
      const token = localStorage.getItem('authToken');
      const menuResponse = await axios.get(
        `${API_BASE_URL}/menu-items/?restaurant=${restaurantResponse.data.id}`,
        {
          headers: {
            'Authorization': `Token ${token}`
          }
        }
      );
      setMenuItems(menuResponse.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, slug]);

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, [fetchRestaurantAndMenu]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Restaurant not found</div>
      </div>
    );
  }

  // Check if user can manage this restaurant
  const canManage = user && (
    restaurant.owner === user.id ||
    user.user_type === 'platform_admin'
  );

  if (!canManage) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          You don't have permission to manage this restaurant.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/vendor/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/restaurants/${restaurant.slug}`}>{restaurant.name}</Link>
          </li>
          <li className="breadcrumb-item active">Manage Menu</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>{restaurant.name} - Menu Management</h1>
          <p className="text-muted">Add, edit, or remove menu items</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-circle"></i> Add Menu Item
        </button>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3 className="text-primary">{menuItems.length}</h3>
              <p className="text-muted mb-0">Total Items</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3 className="text-success">
                {menuItems.filter(item => item.is_available).length}
              </h3>
              <p className="text-muted mb-0">Available</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3 className="text-warning">
                {menuItems.filter(item => !item.is_available).length}
              </h3>
              <p className="text-muted mb-0">Unavailable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {menuItems.length === 0 ? (
        <div className="alert alert-info text-center">
          <h4>No menu items yet</h4>
          <p>Start building your menu by adding your first item!</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-circle"></i> Add First Menu Item
          </button>
        </div>
      ) : (
        <div className="row">
          {menuItems.map(item => (
            <div key={item.id} className="col-md-6 col-lg-4">
              <MenuItemCard
                item={item}
                onUpdate={fetchRestaurantAndMenu}
              />
            </div>
          ))}
        </div>
      )}

      <MenuItemFormModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        restaurantId={restaurant.id}
        onSuccess={() => {
          setShowAddModal(false);
          fetchRestaurantAndMenu();
        }}
      />
    </div>
  );
}
