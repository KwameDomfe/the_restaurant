import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../App';

const DEFAULT_USER_TYPES = [
  { value: 'customer', label: 'Customer', description: 'Order food and enjoy meals' },
  { value: 'vendor', label: 'Vendor', description: 'Manage restaurants and menus' },
  { value: 'delivery', label: 'Delivery', description: 'Deliver orders and earn money' },
  { value: 'staff', label: 'Staff', description: 'Work in restaurants' }
];

// Login page component
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    userType: 'customer'
  });
  const [userTypes, setUserTypes] = useState(DEFAULT_USER_TYPES);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const { setUser, user, API_BASE_URL, showToast } = useApp();
  const navigate = useNavigate();
  
  // Handle keyboard events for password reveal buttons
  const handlePasswordRevealKeyDown = (e, toggleFunction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFunction();
    }
  };

  const fetchUserTypes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/auth/user-types/`);
      setUserTypes(response.data.user_types);
    } catch (error) {
      showToast('Failed to load user types', 'error');
      setUserTypes(DEFAULT_USER_TYPES); // fallback
    }
  }, [API_BASE_URL, showToast]);

  // Load user types on component mount
  useEffect(() => {
    fetchUserTypes();
  }, [fetchUserTypes]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Separate country code and digits
    let countryCode = '';
    let digits = cleaned;
    
    if (cleaned.startsWith('+')) {
      digits = cleaned.slice(1);
      countryCode = '+';
    }
    
    // Limit total digits to 15
    digits = digits.slice(0, 15);
    
    // Format with dashes: +XXX-XX-XXX-XXXX
    if (!digits) return countryCode;
    
    let formatted = countryCode;
    
    // Country code (first 1-3 digits)
    if (digits.length <= 3) {
      formatted += digits;
    } else if (digits.length <= 5) {
      formatted += digits.slice(0, 3) + '-' + digits.slice(3);
    } else if (digits.length <= 8) {
      formatted += digits.slice(0, 3) + '-' + digits.slice(3, 5) + '-' + digits.slice(5);
    } else {
      formatted += digits.slice(0, 3) + '-' + digits.slice(3, 5) + '-' + digits.slice(5, 8) + '-' + digits.slice(8);
    }
    
    return formatted;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Format phone number as user types
    if (name === 'phoneNumber') {
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (isLogin) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
    } else {
      if (!formData.username) newErrors.username = 'Username is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.passwordConfirm) newErrors.passwordConfirm = 'Please confirm your password';
      if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Passwords do not match';
      }
      if (!formData.userType) newErrors.userType = 'Please select a user type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/check-email/`, {
        email
      });
      return response.data.available;
    } catch (error) {
      return true; // Assume available if check fails
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/check-username/`, {
        username
      });
      return response.data.available;
    } catch (error) {
      return true; // Assume available if check fails
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Clear any prior success message when attempting login
    setSuccessMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/login/`, {
        email: formData.email,
        password: formData.password
      });
      
      // Store token
      localStorage.setItem('authToken', response.data.token);
      
      // Set user in context
      setUser(response.data.user);
      
      showToast(response.data.message || 'Login successful!', 'success');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Login failed. Please check your credentials.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check email and username availability
    const emailAvailable = await checkEmailAvailability(formData.email);
    const usernameAvailable = await checkUsernameAvailability(formData.username);

    if (!emailAvailable) {
      setErrors(prev => ({ ...prev, email: 'Email is already registered' }));
      return;
    }
    if (!usernameAvailable) {
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: formData.userType,
        password: formData.password,
        password_confirm: formData.passwordConfirm
      };
      
      // Only include phone number if provided
      if (formData.phoneNumber && formData.phoneNumber.trim()) {
        // Remove dashes for backend (keep only + and digits)
        registrationData.phone_number = formData.phoneNumber.replace(/-/g, '');
      }
      
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/register/`, registrationData);
      
      // Store token
      localStorage.setItem('authToken', response.data.token);
      
      // Set user in context
      setUser(response.data.user);
      
      showToast(response.data.message || 'Registration successful!', 'success');
      
      // Show verification message if email verification was sent
      if (response.data.verification_email_sent) {
        showToast('Please check your email for verification code', 'info');
        // Redirect to verification page
        setTimeout(() => {
          navigate('/verify-email?email=' + encodeURIComponent(response.data.user.email));
        }, 1500);
      } else {
        navigate('/');
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        // Handle field-specific errors
        const newErrors = {};
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            newErrors[field] = errorData[field][0];
          } else if (typeof errorData[field] === 'string') {
            newErrors[field] = errorData[field];
          }
        });
        setErrors(newErrors);
        showToast('Please fix the errors in the form', 'error');
      } else {
        showToast('Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      userType: 'customer'
    });
    setErrors({});
    setSuccessMessage('');
    setShowPassword(false);
    setShowPasswordConfirm(false);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          {user ? (
            <div className="card shadow">
              <div className="card-body p-4 text-center">
                <h2 className="card-title mb-3">✅ Already Logged In</h2>
                <p className="text-muted mb-4">
                  You're currently logged in as <strong>{user.username || user.email}</strong>
                </p>
                <div className="d-grid gap-2">
                  <Link to="/" className="btn btn-primary">
                    🏠 Go to Home
                  </Link>
                  <Link to="/restaurants" className="btn btn-outline-primary">
                    🍽️ Browse Restaurants
                  </Link>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      setUser(null);
                      showToast('Logged out successfully', 'success');
                    }}
                  >
                    🚪 Logout and Login as Different User
                  </button>
                </div>
              </div>
            </div>
          ) : (
          <div className="card shadow auth-card">
            <div className="card-body p-4 auth-form-container">
              <div className="text-center mb-4">
                <h2 className="card-title">
                  {isLogin ? '🔐 Login' : '👤 Create Account'}
                </h2>
                <p className="text-muted">
                  {isLogin 
                    ? 'Welcome back! Please sign in to your account.' 
                    : 'Join our platform and start your journey!'
                  }
                </p>
              </div>

              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}

              <form onSubmit={isLogin ? handleLogin : handleRegister}>
                {!isLogin && (
                  <>
                    {/* User Type Selection */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">I want to join as:</label>
                      <select
                        name="userType"
                        className={`form-select ${errors.userType ? 'is-invalid' : ''}`}
                        value={formData.userType}
                        onChange={handleInputChange}
                      >
                        {userTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.userType && <div className="invalid-feedback">{errors.userType}</div>}
                      {formData.userType && (
                        <div className="form-text">
                          {userTypes.find(t => t.value === formData.userType)?.description}
                        </div>
                      )}
                    </div>

                    {/* Name Fields */}
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                          {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                          {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Username */}
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Choose a unique username"
                      />
                      {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Phone Number <span className="text-muted">(Optional)</span></label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className={`form-control ${errors.phoneNumber || errors.phone_number ? 'is-invalid' : ''}`}
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+233-24-345-3454"
                      maxLength="20"
                    />
                    <small className="form-text text-muted">
                      Format: +[country code]-[area]-[number]-[number] (e.g., +233-24-345-3454)
                    </small>
                    {(errors.phoneNumber || errors.phone_number) && (
                      <div className="invalid-feedback">{errors.phoneNumber || errors.phone_number}</div>
                    )}
                  </div>
                )}

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={isLogin ? "Enter your password" : "Minimum 8 characters"}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary password-reveal-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      onKeyDown={(e) => handlePasswordRevealKeyDown(e, () => setShowPassword(!showPassword))}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex="0"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-group">
                      <input
                        type={showPasswordConfirm ? "text" : "password"}
                        name="passwordConfirm"
                        className={`form-control ${errors.passwordConfirm ? 'is-invalid' : ''}`}
                        value={formData.passwordConfirm}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary password-reveal-btn"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        onKeyDown={(e) => handlePasswordRevealKeyDown(e, () => setShowPasswordConfirm(!showPasswordConfirm))}
                        aria-label={showPasswordConfirm ? "Hide password confirmation" : "Show password confirmation"}
                        title={showPasswordConfirm ? "Hide password confirmation" : "Show password confirmation"}
                        tabIndex="0"
                      >
                        {showPasswordConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.passwordConfirm && <div className="invalid-feedback d-block">{errors.passwordConfirm}</div>}
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className={`btn ${isLogin ? 'btn-primary' : 'btn-success'} w-100 mb-3`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    isLogin ? '🔐 Sign In' : '🎉 Create Account'
                  )}
                </button>

                {/* Switch Mode */}
                <div className="text-center">
                  <p className="mb-0">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={switchMode}
                    >
                      {isLogin ? 'Create one here' : 'Sign in instead'}
                    </button>
                  </p>
                </div>

                {isLogin && (
                  <div className="text-center mt-3">
                    <Link to="/forgot-password" className="text-muted small">
                      Forgot your password?
                    </Link>
                  </div>
                )}
              </form>
            </div>
            
            {/* User Type Info */}
            {!isLogin && (
              <div className="card mt-3">
                <div className="card-body">
                  <h6 className="card-title">👥 Choose Your Role</h6>
                  <div className="row">
                    <div className="col-12">
                      <small className="text-muted">
                        <strong>👨‍🍳 Vendor:</strong> Manage restaurants and menus<br/>
                        <strong>🚗 Delivery:</strong> Deliver orders and earn money<br/>
                        <strong>👥 Staff:</strong> Work in restaurants<br/>
                        <strong>🛍️ Customer:</strong> Order food and enjoy meals
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;