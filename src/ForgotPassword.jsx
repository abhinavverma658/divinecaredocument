import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/password/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('OTP sent to your mail');
        // Keep email for potential next step
      } else {
        setError(data.message || 'Failed to send OTP.');
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-sm-5">
                {/* Brand Logo */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                    style={{ width: '80px', height: '80px' }}>
                    <img
                      src="/16.png"
                      alt="Brand logo"
                    />
                  </div>
                  <h2 className="fw-bold mb-2">Forgot Password?</h2>
                  <p className="text-muted mb-0">Enter your email address and we'll send you a link to reset your password</p>
                </div>

                {/* Forgot Password Form */}
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
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-primary btn-lg w-100 mb-3"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
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
