import { Link } from 'react-router-dom';


const RestaurantCard = ({ restaurant }) => {
  
  // // Debug: log restaurant data to console
  // console.log('Restaurant data:', restaurant);
  
  const imageSrc = restaurant.image 
    || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center';
  
  // Helper to render graphical stars
  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (rounded >= i) {
        stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
      } else if (rounded >= i - 0.5) {
        stars.push(<i key={i} className="bi bi-star-half text-warning"></i>);
      } else {
        stars.push(<i key={i} className="bi bi-star text-warning"></i>);
      }
    }
    return stars;
  };

  return (
    <div className="card mb-3">
      <img src={imageSrc}
        alt={restaurant.name}
        className="card-img-top mb-3"
        style={{objectFit:'cover',height:'320px'}}
      />
      <div className="card-body">
        <h5 className="card-title"
        >
          {restaurant.name} 
          <span className="badge bg-primary me-2">
            {restaurant.cuisine_type}
          </span>
        </h5>
        <p className="card-text mb-1"
        >
          {restaurant.description}
        </p>
        <div className="mb-2"
        >
          Price Range:  &nbsp;
          <span className="badge bg-info text-dark"
          >
            {restaurant.price_range}
          </span>
        </div>
        <div className="mb-2">
          Rating : <span className="me-2"
          >
            {
              renderStars(Number(restaurant.rating))
            }
          </span>
        </div>
        <div className="mb-2"
        >
          <h4>Address:</h4> <span className="me-2">
            <i className="bi bi-geo-alt"></i> 
            {restaurant.address}
          </span>
        </div>
        <div className="mb-2"><h4>Delivery & Minimum Order:</h4>
          <div className="me-2">
            <i className="bi bi-truck"></i> Delivery Fee: GHC {restaurant.delivery_fee}
          </div>
          <div className="me-2">
            <i className="bi bi-truck"></i> Delivery Time: {restaurant.delivery_time}
          </div>
          <span className="me-2">
            <i className="bi bi-cash"></i> Min Order: GHC {restaurant.min_order}
          </span>
        </div>
        <div>
          <h4>Contact:</h4>
          <div className="me-2">
            <i className="bi bi-telephone"></i> {restaurant.phone_number && restaurant.phone_number.trim() ? restaurant.phone_number : 'Not available'}
          </div>
        </div>
        <div>
          <h4>Email:</h4>
          <div className="me-2">
            <i className="bi bi-envelope"></i> {restaurant.email && restaurant.email.trim() ? (
              <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
            ) : 'Not available'}
          </div>
        </div>
        <div>
          <h4>Website:</h4>
          <div className="me-2">
            <i className="bi bi-globe"></i> {restaurant.website && restaurant.website.trim() ? (
              <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                {restaurant.website}
              </a>
            ) : 'Not available'}
          </div>
        </div>
        {
          restaurant.features && restaurant.features.length > 0 && (
            <div className="mt-2">
              {
                restaurant.features.map(
                  (feature, idx) => (
                    <span key={idx} 
                      className="badge bg-secondary me-1"
                    >
                      {feature}
                    </span>
                  )
                )
              }
            </div>
          )
        }
        <div className="mt-3 d-flex gap-2">
          <Link to={`/restaurants/${restaurant.slug}`} 
            className="btn btn-outline-primary w-50"
          >
            View Details
          </Link>
          <Link to={`/restaurants/${restaurant.slug}/menu`} 
            className="btn btn-outline-success w-50"
          >
            View Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
