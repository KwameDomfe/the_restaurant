import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../App';
import axios from 'axios';

export default function MenuItemFormModal({ show, onHide, menuItem, restaurantId, onSuccess }) {
  const { API_BASE_URL } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    ingredients: [],
    allergens: [],
    spice_level: 0,
    prep_time: '',
    is_available: true,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    image: null
  });

  useEffect(() => {
    if (show && restaurantId) {
      fetchCategories();
    }
  }, [show, restaurantId, fetchCategories()]);

  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name || '',
        description: menuItem.description || '',
        price: menuItem.price || '',
        category: String(menuItem.category?.id || menuItem.category || ''),
        ingredients: menuItem.ingredients || [],
        allergens: menuItem.allergens || [],
        spice_level: menuItem.spice_level || 0,
        prep_time: menuItem.prep_time || '',
        is_available: menuItem.is_available !== undefined ? menuItem.is_available : true,
        is_vegetarian: menuItem.is_vegetarian || false,
        is_vegan: menuItem.is_vegan || false,
        is_gluten_free: menuItem.is_gluten_free || false,
        image: null
      });
      setImagePreview(menuItem.image);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        ingredients: [],
        allergens: [],
        spice_level: 0,
        prep_time: '',
        is_available: true,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        image: null
      });
      setImagePreview(null);
    }
    setError('');
  }, [menuItem, show]);

  const fetchCategories = useCallback(async () => {
    try {
      // console.log('Fetching categories for restaurant:', restaurantId);
      const response = await axios.get(
        `${API_BASE_URL}/categories/?restaurant=${restaurantId}`
      );
      // console.log('Categories response:', response.data);
      
      // Ensure we have an array
      const categoriesData = Array.isArray(response.data) 
        ? response.data 
        : (
            response.data.results 
            ? response.data.results 
            : []
          );
      
      setCategories(categoriesData);
      
      if (categoriesData.length === 0) {
        setError('No categories found for this restaurant. Please create categories first.');
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]); // Set to empty array on error
      setError('Failed to load categories: ' + (err.response?.data?.detail || err.message));
    }
  }, [API_BASE_URL, restaurantId]);

  useEffect(() => {
    if (show && restaurantId) {
      fetchCategories();
    }
  }, [show, restaurantId, fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const submitData = new FormData();
      
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('restaurant', restaurantId);
      submitData.append('ingredients', JSON.stringify(formData.ingredients));
      submitData.append('allergens', JSON.stringify(formData.allergens));
      submitData.append('spice_level', formData.spice_level);
      submitData.append('prep_time', formData.prep_time || 0);
      submitData.append('is_available', formData.is_available);
      submitData.append('is_vegetarian', formData.is_vegetarian);
      submitData.append('is_vegan', formData.is_vegan);
      submitData.append('is_gluten_free', formData.is_gluten_free);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (menuItem) {
        await axios.put(
          `${API_BASE_URL}/menu-items/${menuItem.slug}/`,
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
          `${API_BASE_URL}/menu-items/`,
          submitData,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      onSuccess();
      onHide();
    } catch (err) {
      console.error('Error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflow: 'auto' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              {categories.length === 0 && (
                <div className="alert alert-warning">
                  <strong>No categories found!</strong> You need to create menu categories first before adding menu items.
                  Please create categories via Django admin or contact support.
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Price (GHC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Category * {categories.length > 0 && <small className="text-muted">({categories.length} available)</small>}</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="">
                      {categories.length === 0 ? 'Loading categories...' : 'Select a category'}
                    </option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.meal_period ? `(${cat.meal_period})` : ''}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <small className="text-danger">
                      No categories found. Create categories via Django admin for this restaurant.
                    </small>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Spice Level (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="form-control"
                    name="spice_level"
                    value={formData.spice_level}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Prep Time (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="prep_time"
                    value={formData.prep_time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Item Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2"
                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                  />
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Dietary Options</label>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="is_vegetarian"
                    name="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="is_vegetarian">
                    Vegetarian
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="is_vegan"
                    name="is_vegan"
                    checked={formData.is_vegan}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="is_vegan">
                    Vegan
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="is_gluten_free"
                    name="is_gluten_free"
                    checked={formData.is_gluten_free}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="is_gluten_free">
                    Gluten Free
                  </label>
                </div>
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="is_available">
                  Available for ordering
                </label>
              </div>
            </div>

            <div className="modal-footer">
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
                disabled={loading || categories.length === 0}
              >
                {loading ? 'Saving...' : categories.length === 0 ? 'No Categories Available' : 'Save Menu Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
