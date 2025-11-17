import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect back to forgot password
      window.history.pushState({}, '', '/forgot-password');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    // Focus on the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a complete 6-digit OTP.');
      return;
    }
    if (!email) {
      setError('Email not found. Please try again.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/password/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          otp: otpValue 
        }),
      });
      const data = await res.json();
      if (data.success && data.resetToken) {
        setSuccess('OTP verified successfully!');
        // Store resetToken for next step
        sessionStorage.setItem('resetToken', data.resetToken);
        // Redirect to reset password page
        setTimeout(() => {
          window.history.pushState({}, '', '/reset-password');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 1000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForgotPassword = () => {
    sessionStorage.removeItem('resetEmail');
    window.history.pushState({}, '', '/forgot-password');
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
                  <h2 className="fw-bold mb-2 fs-3 fs-sm-2">Verify OTP</h2>
                  <p className="text-muted mb-0 small">
                    Enter the 6-digit OTP sent to<br />
                    <span className="fw-semibold">{email}</span>
                  </p>
                </div>

                {/* OTP Verification Form */}
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
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-center d-block mb-3">
                      Enter OTP
                    </label>
                    <div className="d-flex justify-content-center gap-2 gap-sm-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="1"
                          className="form-control text-center fs-4 fw-bold"
                          style={{ 
                            width: 'clamp(40px, 10vw, 55px)', 
                            height: 'clamp(40px, 10vw, 55px)',
                            fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
                            padding: '0'
                          }}
                          value={digit}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-lg w-100 mb-3"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <div className="text-center">
                    <button 
                      onClick={handleBackToForgotPassword}
                      className="btn btn-link text-decoration-none fw-semibold"
                    >
                      ← Back to Forgot Password
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
