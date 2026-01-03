import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import axios from 'axios';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantFormModal from '../components/RestaurantFormModal';
import { Link } from 'react-router-dom';

export default function VendorDashboard() {
  const { API_BASE_URL, user } = useApp();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalMenuItems: 0,
    activeRestaurants: 0
  });

  useEffect(() => {
    if (user) {
      fetchMyRestaurants();
    }
  }, [user]);

  const fetchMyRestaurants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_BASE_URL}/restaurants/my-restaurants/`,
        {
          headers: {
            'Authorization': `Token ${token}`
          }
        }
      );
      setRestaurants(response.data);
      
      // Calculate stats
      const totalMenuItems = response.data.reduce((sum, r) => sum + (r.menu_items_count || 0), 0);
      const activeRestaurants = response.data.filter(r => r.is_active).length;
      
      setStats({
        totalRestaurants: response.data.length,
        totalMenuItems,
        activeRestaurants
      });
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please log in to access your dashboard.
        </div>
      </div>
    );
  }

  if (user.user_type !== 'vendor' && user.user_type !== 'platform_admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          You don't have permission to access this page. Only vendors and admins can manage restaurants.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>My Restaurant Dashboard</h1>
          <p className="text-muted">Manage your restaurants and menu items</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-circle"></i> Add New Restaurant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h2 className="text-primary">{stats.totalRestaurants}</h2>
              <p className="text-muted mb-0">Total Restaurants</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h2 className="text-success">{stats.activeRestaurants}</h2>
              <p className="text-muted mb-0">Active Restaurants</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h2 className="text-info">{stats.totalMenuItems}</h2>
              <p className="text-muted mb-0">Total Menu Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="alert alert-info text-center">
          <h4>No restaurants yet</h4>
          <p>Get started by adding your first restaurant!</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-circle"></i> Add Restaurant
          </button>
        </div>
      ) : (
        <div className="row">
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="col-md-6 col-lg-4 mb-4">
              <RestaurantCard
                restaurant={restaurant}
                onUpdate={fetchMyRestaurants}
              />
              <Link
                to={`/vendor/restaurants/${restaurant.slug}/menu`}
                className="btn btn-outline-primary w-100 mt-2"
              >
                <i className="bi bi-list-ul"></i> Manage Menu Items
              </Link>
            </div>
          ))}
        </div>
      )}

      <RestaurantFormModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchMyRestaurants();
        }}
      />
    </div>
  );
}
