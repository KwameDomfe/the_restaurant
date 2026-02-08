import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import axios from 'axios';

export default function RestaurantFormModal({ show, onHide, restaurant, onSuccess }) {
  const { API_BASE_URL } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine_type: '',
    address: '',
    phone_number: '',
    email: '',
    website: '',
    price_range: '$$',
    delivery_fee: '2.99',
    delivery_time: '30-45 min',
    min_order: '15.00',
    features: [],
    opening_hours: {},
    is_active: true,
    image: null
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        cuisine_type: restaurant.cuisine_type || '',
        address: restaurant.address || '',
        phone_number: restaurant.phone_number || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        price_range: restaurant.price_range || '$$',
        delivery_fee: restaurant.delivery_fee || '2.99',
        delivery_time: restaurant.delivery_time || '30-45 min',
        min_order: restaurant.min_order || '15.00',
        features: restaurant.features || [],
        opening_hours: restaurant.opening_hours || {},
        is_active: restaurant.is_active !== undefined ? restaurant.is_active : true,
        image: null
      });
      setImagePreview(restaurant.image);
    } else {
      setFormData({
        name: '',
        description: '',
        cuisine_type: '',
        address: '',
        phone_number: '',
        email: '',
        website: '',
        price_range: '$$',
        delivery_fee: '2.99',
        delivery_time: '30-45 min',
        min_order: '15.00',
        features: [],
        opening_hours: {},
        is_active: true,
        image: null
      });
      setImagePreview(null);
    }
    setError('');
    setSuccess('');
  }, [restaurant, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(
        prev => (
          {
            ...prev,
            [name]: checked
          }
        )
      );
    } else {
      setFormData(
        prev => (
          {
            ...prev,
            [name]: value
          }
        )
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        e.target.value = null;
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or WebP)');
        e.target.value = null;
        return;
      }

      setError('');
      setFormData(
        prev => (
          { 
            ...prev, 
            image: file 
          }
        )
      );
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(
      prev => (
        {
          ...prev,
          features: prev.features.includes(feature)
            ? prev.features.filter(f => f !== feature)
            : [...prev.features, feature]
        }
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate numeric fields
    if (parseFloat(formData.delivery_fee) < 0) {
      setError('Delivery fee cannot be negative');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.min_order) < 0) {
      setError('Minimum order cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'features' || key === 'opening_hours') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'image' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== 'image') {
          submitData.append(key, formData[key]);
        }
      });

      if (restaurant) {
        await axios.patch(
          `${API_BASE_URL}/restaurants/${restaurant.slug}/`,
          submitData,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/restaurants/`,
          submitData,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      setSuccess(restaurant 
        ? 'Restaurant updated successfully!' 
        : 'Restaurant created successfully!'
      );
      setTimeout(() => {
        onSuccess();
        onHide();
      }, 1000);
    } catch (err) {
      // Enhanced error handling
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object' && !errors.detail) {
          // Display field-specific errors
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => {
              const fieldName = field.replace(/_/g, ' ');
              const message = Array.isArray(messages) ? messages[0] : messages;
              return `${fieldName}: ${message}`;
            })
            .join('. ');
          setError(errorMessages);
        } else {
          setError(errors.detail || 'Failed to save restaurant');
        }
      } else {
        setError('Failed to save restaurant. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const availableFeatures = [
    'wifi', 'parking', 'delivery', 'takeout', 'outdoor_seating',
    'wheelchair_accessible', 'credit_cards', 'reservations'
  ];

  const popularCuisines = [
    'Italian', 'Japanese', 'Chinese', 'Mexican', 'Indian', 'American',
    'Thai', 'French', 'Korean', 'Mediterranean', 'Vegetarian', 'Fast Food',
    'Seafood', 'BBQ', 'Continental', 'Fusion', 'Other'
  ];

  if (!show) return null;

  return (
    <div className="modal fade show d-block" 
      tabIndex="-1" 
      style={
        { 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          overflow: 'auto' 
        }
      }
    >
      <div className="modal-dialog modal-lg"
      >
        <div className="modal-content"
        >
          <header className="modal-header"
          >
            <h5 className="modal-title"
            >
              {
                restaurant 
                  ? 'Edit Restaurant' 
                  : 'Add New Restaurant'
              }
            </h5>
            <button type="button" 
              className="btn-close" 
              onClick={onHide}
            >
              X
            </button>
          </header>

          <form onSubmit={handleSubmit}
          >
            <div className="modal-body"
            >
              {
                error && (
                  <div className="alert alert-danger alert-dismissible fade show" 
                    role="alert"
                  >
                    {error}
                    <button type="button" 
                      className="btn-close" 
                      onClick={
                        () => setError('')
                      }
                    >
                    </button>
                  </div>
                )
              }
              {
                success && (
                  <div className="alert alert-success alert-dismissible fade show" 
                    role="alert"
                  >
                    {success}
                    <button type="button" 
                      className="btn-close" 
                      onClick={
                        () => setSuccess('')
                      }
                    >
                    </button>
                  </div>
                )
              }
              <div className="mb-3"
              >
                <label className="form-label"
                >
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3"
              >
                <label className="form-label"
                >
                  Description *
                </label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="row"
              >
                <div className="col-md-6 mb-3"
                >
                  <label className="form-label"
                  >
                    Cuisine Type *
                  </label>
                  <select
                    className="form-select"
                    name="cuisine_type"
                    value={formData.cuisine_type}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value=""
                    >
                      Select cuisine type...
                    </option>
                    {
                      popularCuisines.map(
                        cuisine => (
                          <option key={cuisine} 
                            value={cuisine}
                          >
                            {cuisine}
                          </option>
                        )
                      )
                    }
                  </select>
                </div>

                <div className="col-md-6 mb-3"
                >
                  <label className="form-label"
                  >
                    Price Range *
                  </label>
                  <select
                    className="form-select"
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="$"
                    >
                      $ - Budget
                    </option>
                    <option value="$$"
                    >
                      $$ - Moderate
                    </option>
                    <option value="$$$"
                    >
                      $$$ - Expensive
                    </option>
                    <option value="$$$$"
                    >
                      $$$$ - Fine Dining
                    </option>
                  </select>
                </div>
              </div>

              <div className="mb-3"
              >
                <label className="form-label"
                >
                  Address *
                </label>
                <textarea
                  className="form-control"
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="row"
              >
                <div className="col-md-6 mb-3"
                >
                  <label className="form-label"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6 mb-3"
                >
                  <label className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3"
              >
                <label className="form-label"
                >
                  Website
                </label>
                <input
                  type="url"
                  className="form-control"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="row"
              >
                <div className="col-md-4 mb-3"
                >
                  <label className="form-label"
                  >
                    Delivery Fee (GHC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="delivery_fee"
                    value={formData.delivery_fee}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-4 mb-3"
                >
                  <label className="form-label"
                  >
                    Delivery Time
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="delivery_time"
                    value={formData.delivery_time}
                    onChange={handleChange}
                    placeholder="e.g., 30-45 min"
                    disabled={loading}
                  />
                </div>

                <div className="col-md-4 mb-3"
                >
                  <label className="form-label"
                  >
                    Min Order (GHC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="min_order"
                    value={formData.min_order}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3"
              >
                <label className="form-label">Restaurant Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <small className="form-text text-muted">
                  Max size: 5MB. Accepted formats: JPEG, PNG, WebP
                </small>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-thumbnail"
                      style={
                        { 
                          maxWidth: '200px', 
                          maxHeight: '150px', 
                          objectFit: 'cover' 
                        }
                      }
                    />
                  </div>
                )}
              </div>

              <div className="mb-3"
              >
                <label className="form-label"
                >
                  Features
                </label>
                <div className="d-flex flex-wrap gap-2"
                >
                  {
                    availableFeatures.map(
                      feature => (
                        <button
                          key={feature}
                          type="button"
                          className={`btn btn-sm 
                            ${
                              formData.features.includes(feature)
                                ? 'btn-primary'
                                : 'btn-outline-secondary'
                            }`
                          }
                          onClick={
                            () => handleFeatureToggle(feature)
                          }
                          disabled={loading}
                        >
                          {feature.replace(/_/g, ' ')}
                        </button>
                      )
                    )
                  }
                </div>
              </div>

              <div className="form-check mb-3"
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={loading}
                />
                <label className="form-check-label" 
                  htmlFor="is_active"
                >
                  Active (visible to customers)
                </label>
              </div>
            </div>

            <footer className="modal-footer"
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Restaurant'}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
