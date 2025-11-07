import React, { useState } from 'react';
// Use Vite env variable for API URL
const API_URL = import.meta.env.VITE_API_URL;
import 'bootstrap/dist/css/bootstrap.min.css';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        // Store token (localStorage/sessionStorage as needed)
        localStorage.setItem('token', data.data.token);
        // Optionally store user info
        localStorage.setItem('user', JSON.stringify(data.data.user));
        // Navigate to /home
        window.history.pushState({}, '', '/home');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
                  <div className="d-inline-flex align-items-center justify-content-center  rounded-circle mb-3" 
                    style={{ width: '80px', height: '80px' }}>
                    {/* Prefer a project logo at /logo.png (put your logo in the public/ folder).
                        If that file is missing we'll fall back to an inline SVG so a logo always appears. */}
                    <img
                      src="/16.png"
                      alt="Brand logo"
                      // onError={(e) => {
                      //   // Replace with an inline SVG (encoded) as a fallback if /logo.png isn't present
                      //   try {
                      //     const svg = `
                      //       <svg xmlns='http://www.w3.org/2000/svg' width='160' height='56' viewBox='0 0 160 56'>
                      //         <rect width='160' height='56' fill='none'/>
                      //         <g>
                      //           <circle cx='28' cy='28' r='22' fill='%231c5aa6' />
                      //           <path d='M44 28a18 18 0 1 0 36 0 18 18 0 1 0-36 0' fill='%23ffd54f' opacity='0.95'/>
                      //           <text x='74' y='36' font-family='Arial, Helvetica, sans-serif' font-size='20' fill='%231c5aa6' font-weight='700'>DCARE</text>
                      //         </g>
                      //       </svg>
                      //     `;
                      //     e.currentTarget.onerror = null;
                      //     e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                      //   } catch (err) {
                      //     // If anything goes wrong just remove the image so layout remains stable
                      //     e.currentTarget.remove();
                      //   }
                      // }}
                    />
                  </div>
                  <h2 className="fw-bold mb-2">Welcome Back</h2>
                  <p className="text-muted mb-0">Sign in to continue to your account</p>
                </div>

                {/* Sign In Form */}
                <div>
                  {error && (
                    <div className="alert alert-danger py-2" role="alert">
                      {error}
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

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-lg"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                            <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <a 
                      href="#" 
                      className="text-decoration-none small"
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, '', '/forgot-password');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-primary btn-lg w-100 mb-3"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>

                  {/* <div className="text-center">
                    <span className="text-muted">Don't have an account? </span>
                    <a href="#" className="text-decoration-none fw-semibold">
                      Sign Up
                    </a>
                  </div> */}
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
