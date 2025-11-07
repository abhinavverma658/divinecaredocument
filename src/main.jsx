import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SignInPage from './App.jsx'
import Home from './home.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import VerifyOtp from './VerifyOtp.jsx'
import ResetPassword from './ResetPassword.jsx'

function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  if (path === '/home') return <Home />;
  if (path === '/forgot-password') return <ForgotPassword />;
  if (path === '/verify-otp') return <VerifyOtp />;
  if (path === '/reset-password') return <ResetPassword />;
  return <SignInPage />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
