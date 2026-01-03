
import React from 'react';
import { Link } from 'react-router-dom';

const MEAL_PERIOD_LABELS = {
  breakfast: '☀️ Breakfast',
  brunch: '🍳 Brunch',
  lunch: '🍔 Lunch',
  supper: '🌙 Supper',
  dinner: '🍽️ Dinner',
  all_day: '🕑 All Day',
};

const MenuCategories = ({ categories = [] }) => {
  // Group categories by meal period
  const grouped = React.useMemo(() => {
    const result = {};
    categories.forEach(cat => {
      const period = cat.meal_period || 'all_day';
      if (!result[period]) result[period] = [];
      result[period].push(cat);
    });
    return result;
  }, [categories]);

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">🍴 Menu Categories</h2>
          <p className="text-muted mb-0"
          >
            Browse our menu categories by meal period
          </p>
        </div>
        <Link to="/menu" className="btn btn-outline-primary">
          View Full Menu →
        </Link>
      </div>
      
      {Object.keys(MEAL_PERIOD_LABELS).map(period => (
        grouped[period] && grouped[period].length > 0 && (
          <div key={period} className="mb-4">
            <h4 className="mb-3">
              {MEAL_PERIOD_LABELS[period]}{' '}
              <span className="badge bg-secondary ms-2"
              >
                {grouped[period].length} categories
              </span>
            </h4>
            <div className="row"
            >
              {
                grouped[period].map(
                  (cat, idx) => (
                    <div className="col-md-6 col-lg-4 mb-3" key={cat.id || idx}
                    >
                      <Link 
                        to={`/categories/${cat.slug || encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="text-decoration-none"
                        style={{ cursor: 'pointer' }}
                        title={`View ${cat.name} items`}
                      >
                        <div className="card 
                          h-100 
                          shadow-sm 
                          text-center 
                          category-card"
                        >
                          {cat.image ? (
                            <img 
                              src={cat.image} 
                              alt={cat.name} 
                              className="card-img-top" 
                              style={{height:'100px',objectFit:'cover'}} 
                            />
                          ) : (
                            <div style={{
                              height:'100px',
                              background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display:'flex',
                              alignItems:'center',
                              justifyContent:'center'
                            }}>
                              <span role="img" aria-label="category" style={{fontSize:'2rem'}}>🍽️</span>
                            </div>
                          )}
                          <div className="card-body">
                            <h6 className="mt-2 mb-1 text-dark">{cat.name}</h6>
                            {cat.description && (
                              <div className="text-muted small mb-2">{cat.description}</div>
                            )}
                            {cat.item_count !== undefined && (
                              <div className="badge bg-light text-dark">
                                {cat.item_count} {cat.item_count === 1 ? 'item' : 'items'}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                )
              }
            </div>
          </div>
        )
      ))}
      
      {categories.length === 0 && (
        <div className="text-center py-5">
          <div className="text-muted mb-3" style={{fontSize: '3rem'}}>🍽️</div>
          <p className="text-muted">No menu categories available at the moment.</p>
          <Link to="/restaurants" className="btn btn-primary mt-2">
            Browse Restaurants
          </Link>
        </div>
      )}
      
      <style>{`
        .category-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
          border-color: #667eea;
        }
        .category-card:hover .card-body h6 {
          color: #667eea !important;
        }
      `}</style>
    </div>
  );
};

export default MenuCategories;
