import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    // Get resetToken from sessionStorage
    const token = sessionStorage.getItem('resetToken');
    if (token) {
      setResetToken(token);
    } else {
      // If no token found, redirect back to forgot password
      window.history.pushState({}, '', '/forgot-password');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/password/reset-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          password,
          confirmPassword
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password reset successfully!');
        sessionStorage.removeItem('resetToken');
        // Optionally redirect to login after a delay
        setTimeout(() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-3 py-sm-4">
      <div className="container px-3 px-sm-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-3 p-sm-4 p-md-5">
                {/* Brand Logo */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                    style={{ width: '80px', height: '80px' }}>
                    <img
                      src="/16.png"
                      alt="Brand logo"
                    />
                  </div>
                  <h2 className="fw-bold mb-2 fs-3 fs-sm-2">Set New Password</h2>
                  <p className="text-muted mb-0 small">Enter your new password below</p>
                </div>

                {/* Reset Password Form */}
                <div>
                  {error && (
                    <div className="alert alert-danger py-2" role="alert">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success py-2" role="alert">
                      {success}
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-lg w-100 mb-3"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <div className="text-center">
                    <button 
                      onClick={handleBackToLogin}
                      className="btn btn-link text-decoration-none fw-semibold"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                © 2025 Divine Care. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
