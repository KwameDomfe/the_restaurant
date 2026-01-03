import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useApp } from '../App';
import MenuItemFormModal from '../components/MenuItemFormModal';
import axios from 'axios';

// Enhanced Menu Item Card Component
const MenuItemCard = ({ item, onUpdate }) => {
  const { addToCart } = useCart();
  const { user, API_BASE_URL } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check if user can edit (owns the restaurant or is admin)
  const canEdit = user && (
    (item.restaurant && item.restaurant.owner === user.id) ||
    user.user_type === 'platform_admin'
  );
  const getSpiceLevel = (level) => {
    const spices = ['🌶️', '🌶️🌶️', '🌶️🌶️🌶️', '🌶️🌶️🌶️🌶️'];
    return level > 0 ? spices[level - 1] || '🌶️🌶️🌶️🌶️' : '';
  };

  const getDietaryTags = (item) => {
    const tags = [];
    if (item.is_vegetarian) tags.push({ label: '🌱 Vegetarian', class: 'success' });
    if (item.is_vegan) tags.push({ label: '🌿 Vegan', class: 'success' });
    if (item.is_gluten_free) tags.push({ label: '🌾 Gluten-Free', class: 'info' });
    return tags;
  };

  const getMenuItemImage = (item) => {
    if (item.image) return item.image;
    
    // Default food images based on name/ingredients
    const itemName = item.name.toLowerCase();
    if (itemName.includes('pasta') || itemName.includes('spaghetti') || itemName.includes('penne')) {
      return 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop';
    }
    if (itemName.includes('sushi') || itemName.includes('roll')) {
      return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop';
    }
    if (itemName.includes('bowl') || itemName.includes('buddha')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop';
    }
    if (itemName.includes('smoothie') || itemName.includes('juice')) {
      return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=200&fit=crop';
    }
    if (itemName.includes('bruschetta') || itemName.includes('calamari')) {
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop';
  };

  return (
    <div className="mb-4">
      <div className="card h-100 shadow-sm menu-item-card">
        <img 
          src={getMenuItemImage(item)} 
          className="card-img-top"
          alt={item.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column"
        >
          <div className="d-flex justify-content-between align-items-start mb-2"
          >
            <h5 className="card-title mb-0">{item.name}</h5>
            {
              item.restaurant_name && (
                <small className="badge bg-secondary"
                >
                  {item.restaurant_name}
                </small>
              )
            }
          </div>
          <p className="card-text text-muted small flex-grow-1"
          >
            {item.description}
          </p>
          
          {/* Dietary Tags */}
          {getDietaryTags(item).length > 0 && (
            <div className="mb-2">
              {
                getDietaryTags(item).map(
                  (tag, index) => (
                    <span key={index} 
                      className={`badge bg-${tag.class} me-1 mb-1`} 
                      style={{ fontSize: '0.7em' }}
                    >
                      {tag.label}
                    </span>
                  )
                )
              }
            </div>
          )}

          {/* Details Row */}
          <div className="row text-center mb-3">
            <div className="col-4">
              <small className="text-muted">Prep Time</small>
              <div><strong>⏱️ {item.prep_time}m</strong></div>
            </div>
            {item.spice_level > 0 && (
              <div className="col-4">
                <small className="text-muted">Spice</small>
                <div>{getSpiceLevel(item.spice_level)}</div>
              </div>
            )}
            <div className="col-4">
              <small className="text-muted">Available</small>
              <div>{item.is_available ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="mb-2">
              <small className="text-muted fw-bold">Ingredients:</small>
              <div className="small mt-1">
                {
                  item.ingredients.slice(0, 5).map(
                    (ingredient, idx) => {
                      if (typeof ingredient === 'object' && ingredient.name) {
                        const parts = [];
                        parts.push(ingredient.name.replace(/_/g, ' '));
                        if (ingredient.quantity) {
                          parts.push(`(${ingredient.quantity}${ingredient.unit ? ingredient.unit : ''})`);
                        }
                        return (
                          <span key={idx} className="badge bg-light text-dark border me-2 mb-1">
                            {parts.join(' ')}
                          </span>
                        );
                      }
                      const name = typeof ingredient === 'string' ? ingredient.replace(/_/g, ' ') : ingredient;
                      return (
                        <span key={idx} className="badge bg-light text-dark border me-1 mb-1">
                          {name}
                        </span>
                      );
                    }
                  )
                }
                {item.ingredients.length > 5 && (
                  <span className="badge bg-light text-dark border">+{item.ingredients.length - 5} more</span>
                )}
              </div>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="mt-auto d-flex justify-content-between align-items-center"
          >
            <span className="h5 text-success mb-0"
            >
              GHC {parseFloat(item.price).toFixed(2)}
            </span>
            <button 
              className={`btn ${item.is_available ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => addToCart(item)}
              disabled={!item.is_available}
            >
              {item.is_available ? '🛒 Add to Cart' : 'Unavailable'}
            </button>
          </div>

          {/* Edit/Delete buttons for owners/admins */}
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
                onClick={async () => {
                  if (!window.confirm('Delete this menu item?')) return;
                  setDeleting(true);
                  try {
                    const token = localStorage.getItem('authToken');
                    await axios.delete(`${API_BASE_URL}/menu-items/${item.slug}/`, {
                      headers: { 'Authorization': `Token ${token}` }
                    });
                    if (onUpdate) onUpdate();
                  } catch (err) {
                    alert('Failed to delete: ' + (err.response?.data?.detail || err.message));
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
              >
                <i className="bi bi-trash"></i> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <MenuItemFormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        menuItem={item}
        restaurantId={item.restaurant}
        onSuccess={() => {
          setShowEditModal(false);
          if (onUpdate) onUpdate();
        }}
      />
    </div>
  );
};

export default MenuItemCard;