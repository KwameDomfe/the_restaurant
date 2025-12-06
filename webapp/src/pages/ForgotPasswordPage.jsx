import React, { useState } from 'react';
import axios from 'axios';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
// Forgot Password page component
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { API_BASE_URL, showToast } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/auth/request-password-reset/`, {
        email
      });
      setMessage(response.data.message || 'Password reset instructions have been sent to your email.');
      showToast('Password reset email sent!', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send reset email. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title">🔐 Reset Password</h2>
                <p className="text-muted">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {message && (
                <div className="alert alert-success" role="alert">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    '📧 Send Reset Instructions'
                  )}
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    ← Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;