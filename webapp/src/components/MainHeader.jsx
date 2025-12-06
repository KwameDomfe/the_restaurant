import React from 'react';
import { useLocation } from 'react-router-dom';

const getHeaderTitle = (pathname) => {
  if (pathname === '/') return 'Home';
  if (pathname === '/restaurants') return 'All Restaurants';
  if (pathname.startsWith('/restaurants/')) return 'Restaurant Details';
  if (pathname === '/menu') return 'Menu';
  if (pathname.startsWith('/menu-items/')) return 'Menu Item Details';
  if (pathname === '/cart') return 'Your Cart';
  if (pathname === '/checkout') return 'Checkout';
  if (pathname === '/login') return 'Login';
  if (pathname === '/forgot-password') return 'Forgot Password';
  return 'The Restaurant';
};

const MainHeader = () => {
  const location = useLocation();
  const title = getHeaderTitle(location.pathname);

  return (
    <header className="bg-primary text-white py-3 mb-4 shadow-sm "
    >
      <nav className="navbar navbar-expand-lg navbar-dark container">
        <div className="container-fluid">
          <a className="navbar-brand h4 mb-0" href="/">Home</a>
          <button className="navbar-toggler" 
            type="button" data-bs-toggle="collapse" 
            data-bs-target="#mainNavbar" 
            aria-controls="mainNavbar" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
            style={{zIndex: 1051}}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div id="mainNavbar"
            className="collapse navbar-collapse"
          >
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link text-white" href="/restaurants">Restaurants</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="/menu">Menu</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="/cart">Cart</a>
              </li>
            </ul>
            <div className=''>
              <a className="btn btn-outline-light ms-2" href="/login">Login</a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default MainHeader;