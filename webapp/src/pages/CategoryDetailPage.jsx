import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../App';
import MenuItemCard from './MenuItemCard';
import { MenuItemSkeleton } from '../components/SkeletonLoader';

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { API_BASE_URL, showToast } = useApp();
  
  const [category, setCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategoryAndItems();
  }, [slug]);

  const loadCategoryAndItems = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all categories to find the one with matching slug
      const categoriesResponse = await axios.get(`${API_BASE_URL}/categories/`);
      const categories = categoriesResponse.data.results || categoriesResponse.data;
      
      // Find category by slug
      const foundCategory = categories.find(cat => 
        cat.slug === slug || 
        cat.name.toLowerCase().replace(/\s+/g, '-') === slug
      );

      if (!foundCategory) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      setCategory(foundCategory);

      // Load menu items for this category using category ID
      const menuItemsResponse = await axios.get(`${API_BASE_URL}/menu-items/?category=${foundCategory.id}`);
      const items = menuItemsResponse.data.results || menuItemsResponse.data;
      setMenuItems(items);
    } catch (err) {
      console.error('Error loading category:', err);
      setError('Failed to load category. Please try again.');
      showToast('Failed to load category', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="row">
          <div className="col-12 mb-4">
            <div className="placeholder-glow">
              <span className="placeholder col-6 placeholder-lg"></span>
            </div>
          </div>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="col-md-6 col-lg-4 mb-4">
              <MenuItemSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <div>
            <strong>Error!</strong> {error}
          </div>
        </div>
        <Link to="/" className="btn btn-primary">
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <h2>Category Not Found</h2>
          <p className="text-muted">The category you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {category.name}
              </li>
            </ol>
          </nav>

          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="display-4 mb-2">{category.name}</h1>
              {category.description && (
                <p className="lead text-muted">{category.description}</p>
              )}
              <div className="d-flex gap-2 align-items-center">
                {category.meal_period && (
                  <span className="badge bg-primary">
                    {category.meal_period.replace('_', ' ').toUpperCase()}
                  </span>
                )}
                <span className="text-muted">
                  {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {menuItems.length > 0 ? (
        <div className="row">
          {menuItems.map(item => (
            <div key={item.id} className="col-md-6 col-lg-4 mb-4">
              <MenuItemCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="text-muted mb-3" style={{fontSize: '3rem'}}>🍽️</div>
          <h3>No items in this category yet</h3>
          <p className="text-muted">Check back later for delicious additions!</p>
          <Link to="/menu" className="btn btn-primary mt-3">
            Browse All Menu Items
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailPage;
