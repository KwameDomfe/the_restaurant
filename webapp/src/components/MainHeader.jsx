import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../App';
import ProfileModal from './ProfileModal';

const MainHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, showToast } = useApp();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const closeOffcanvas = () => {
    const offcanvas = document.getElementById('mobileMenu');
    const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(offcanvas);
    bsOffcanvas?.hide();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user) return '';
    const name = user.username || user.email || '';
    return name.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.username || user.first_name || user.email?.split('@')[0] || 'User';
  };

  const getProfileImageUrl = () => {
    if (!user?.profile_picture) return null;
    let url = user.profile_picture;
    // If the URL is relative, make it absolute
    if (url.startsWith('/media/')) {
      url = `http://localhost:8000${url}`;
    }
    return url;
  };

  return (
    <header className="bg-primary text-white py-3 mb-4 shadow-sm">
      <nav className="navbar navbar-dark container">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand h4 mb-0">Home</Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="navbar-toggler d-lg-none" 
            type="button" 
            data-bs-toggle="offcanvas" 
            data-bs-target="#mobileMenu" 
            aria-controls="mobileMenu"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center ms-auto">
            <ul className="navbar-nav d-flex flex-row mb-0 me-3">
              <li className="nav-item me-3">
                <Link to="/restaurants" className="nav-link text-white">Restaurants</Link>
              </li>
              <li className="nav-item me-3">
                <Link to="/menu" className="nav-link text-white">Menu</Link>
              </li>
              <li className="nav-item me-3">
                <Link to="/cart" className="nav-link text-white">Cart</Link>
              </li>
            </ul>
              {user ? (
                <div className="dropdown w-100"
                >
                  <button 
                    className="btn btn-link text-white text-decoration-none dropdown-toggle"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user.profile_picture ? (
                      <img 
                        src={getProfileImageUrl()} 
                        alt={getUserDisplayName()}
                        className="rounded-circle me-2"
                        style={
                          { width: '35px', 
                            height: '35px', 
                            objectFit: 'cover' 
                          }
                        }
                      />
                    ) : (
                      <div 
                        className="rounded-circle 
                          bg-light text-primary 
                          d-flex 
                          align-items-center 
                          justify-content-center 
                          me-2"
                        style={
                          { width: '35px', 
                            height: '35px', 
                            fontWeight: 'bold' 
                          }
                        }
                      >
                        {getUserInitials()}
                      </div>
                    )}
                    {/* <span className="d-none d-md-inline">{getUserDisplayName()}</span> */}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" 
                    aria-labelledby="userDropdown"
                  >
                    <li>
                      <div className="dropdown-item-text">
                        <div className="d-flex align-items-center">
                          {user.profile_picture ? (
                            <img 
                              src={getProfileImageUrl()} 
                              alt={getUserDisplayName()}
                              className="rounded-circle me-2"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: '40px', height: '40px', fontWeight: 'bold', fontSize: '18px' }}
                            >
                              {getUserInitials()}
                            </div>
                          )}
                          <div>
                            <div className="fw-bold">{getUserDisplayName()}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => setShowProfileModal(true)}
                      >
                        <i className="bi bi-person me-2"></i>My Profile
                      </button>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => navigate('/orders')}
                      >
                        <i className="bi bi-bag me-2"></i>My Orders
                      </button>
                    </li>
                    {(user?.user_type === 'vendor' || user?.user_type === 'platform_admin') && (
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => navigate('/vendor/dashboard')}
                        >
                          <i className="bi bi-shop me-2"></i>My Restaurants
                        </button>
                      </li>
                    )}
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => navigate('/settings')}
                      >
                        <i className="bi bi-gear me-2"></i>Settings
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-outline-light ms-2">Login</Link>
              )}
          </div>

          {/* Mobile Offcanvas Menu */}
          <div 
            className="offcanvas offcanvas-end" 
            tabIndex="-1" 
            id="mobileMenu"
            aria-labelledby="mobileMenuLabel"
          >
            <div className="offcanvas-header bg-primary text-white">
              <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="offcanvas" 
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              {/* User Info Section */}
              {user && (
                <div className="mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center mb-3">
                    {user.profile_picture ? (
                      <img 
                        src={getProfileImageUrl()} 
                        alt={getUserDisplayName()}
                        className="rounded-circle me-3"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                        style={{ width: '50px', height: '50px', fontWeight: 'bold', fontSize: '20px' }}
                      >
                        {getUserInitials()}
                      </div>
                    )}
                    <div>
                      <div className="fw-bold">{getUserDisplayName()}</div>
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <ul className="navbar-nav mb-4">
                <li className="nav-item mb-2">
                  <Link 
                    to="/restaurants" 
                    className="nav-link text-dark"
                    onClick={closeOffcanvas}
                  >
                    <i className="bi bi-shop me-2"></i>Restaurants
                  </Link>
                </li>
                <li className="nav-item mb-2">
                  <Link 
                    to="/menu" 
                    className="nav-link text-dark"
                    onClick={closeOffcanvas}
                  >
                    <i className="bi bi-list me-2"></i>Menu
                  </Link>
                </li>
                <li className="nav-item mb-2">
                  <Link 
                    to="/cart" 
                    className="nav-link text-dark"
                    onClick={closeOffcanvas}
                  >
                    <i className="bi bi-cart me-2"></i>Cart
                  </Link>
                </li>
              </ul>

              {/* User Menu Items */}
              {user ? (
                <>
                  <hr />
                  <ul className="navbar-nav mb-3">
                    <li className="nav-item mb-2">
                      <button 
                        className="nav-link btn btn-link text-dark text-start w-100 text-decoration-none" 
                        onClick={() => {
                          setShowProfileModal(true);
                          closeOffcanvas();
                        }}
                      >
                        <i className="bi bi-person me-2"></i>My Profile
                      </button>
                    </li>
                    <li className="nav-item mb-2">
                      <Link 
                        to="/orders" 
                        className="nav-link text-dark"
                        onClick={closeOffcanvas}
                      >
                        <i className="bi bi-bag me-2"></i>My Orders
                      </Link>
                    </li>
                    {(user?.user_type === 'vendor' || user?.user_type === 'platform_admin') && (
                      <li className="nav-item mb-2">
                        <Link 
                          to="/vendor/dashboard" 
                          className="nav-link text-dark"
                          onClick={closeOffcanvas}
                        >
                          <i className="bi bi-shop me-2"></i>My Restaurants
                        </Link>
                      </li>
                    )}
                    <li className="nav-item mb-2">
                      <Link 
                        to="/settings" 
                        className="nav-link text-dark"
                        onClick={closeOffcanvas}
                      >
                        <i className="bi bi-gear me-2"></i>Settings
                      </Link>
                    </li>
                  </ul>
                  <hr />
                  <button 
                    className="btn btn-danger w-100"
                    onClick={() => {
                      handleLogout();
                      closeOffcanvas();
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="btn btn-primary w-100"
                  onClick={closeOffcanvas}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal 
        show={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </header>
  );
};

export default MainHeader;