
import React from 'react';

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
      <h2>🍴 Menu Categories</h2>
      <p className="text-muted">Browse our menu categories by meal period.</p>
      {Object.keys(MEAL_PERIOD_LABELS).map(period => (
        grouped[period] && grouped[period].length > 0 && (
          <div key={period} className="mb-4">
            <h4 className="mb-3">
              {MEAL_PERIOD_LABELS[period]}{' '}
              <span className="badge bg-secondary ms-2">{grouped[period].length} categories</span>
            </h4>
            <div className="row">
              {grouped[period].map((cat, idx) => (
                <div className="col-md-4 col-lg-2 mb-3" key={cat.id || idx}>
                  <div className="card h-100 shadow-sm text-center">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="card-img-top" style={{height:'100px',objectFit:'cover'}} />
                    ) : (
                      <div style={{height:'100px',background:'#eee',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <span role="img" aria-label="category" style={{fontSize:'2rem'}}>🍽️</span>
                      </div>
                    )}
                    <div className="card-body">
                      <h6 className="mt-2 mb-0">{cat.name}</h6>
                      {cat.description && <div className="text-muted small">{cat.description}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
      {categories.length === 0 && (
        <div className="text-muted">No menu categories found.</div>
      )}
    </div>
  );
};

export default MenuCategories;
