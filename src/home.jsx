import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL || '';

export default function Home() {
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/documents`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.documents)) {
          setDocuments(data.documents);
        } else {
          setError(data.message || 'Failed to load documents.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleView = (doc) => {
    // Build full URL for viewing the document. If doc.fileUrl is absolute, use it as-is.
    if (!doc || !doc.fileUrl) return;
    const isAbsolute = /^https?:\/\//i.test(doc.fileUrl);
    let fullUrl = '';
    if (isAbsolute) {
      fullUrl = doc.fileUrl;
    } else {
      const base = (BASE_URL || '').replace(/\/$/, '');
      const path = doc.fileUrl.replace(/^\/+/, '');
      fullUrl = base ? `${base}/${path}` : `/${path}`;
    }
    // Open the backend-served file URL directly in a new tab
    window.open(fullUrl, '_blank');
  };

  const handleDownload = async (doc) => {
    // Use title, fallback to filePublicId, sanitize filename
    let filename = doc.title ? doc.title.replace(/_/g, ' ') : '';
    if (!filename && doc.filePublicId) {
      // Extract last part of filePublicId and replace underscores
      const parts = doc.filePublicId.split('/');
      filename = parts[parts.length - 1].replace(/_/g, ' ');
    }
    if (!filename) filename = 'document';
    // Add extension if MIME type is PDF and not present
    if (doc.mimeType === 'application/pdf' && !filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }
    // Remove any unsafe characters
    filename = filename.replace(/[^a-zA-Z0-9 ._-]/g, '');
    let fileUrl = '';
    try {
      // Build full file URL (same logic as handleView). Use API_URL as a fallback base.
      const isAbsolute = /^https?:\/\//i.test(doc.fileUrl || '');
      const baseRaw = BASE_URL || API_URL || '';
      const base = (baseRaw || '').replace(/\/$/, '');
      const path = (doc.fileUrl || '').replace(/^\/+/, '');
      fileUrl = isAbsolute ? doc.fileUrl : (base ? `${base}/${path}` : `/${path}`);

      // Debug: log constructed URL and token presence
      const token = localStorage.getItem('token');
      console.debug('Downloading file from:', fileUrl, 'tokenPresent:', !!token);

      // Prepare headers (only include Authorization when token exists)
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(fileUrl, { headers });

      if (!response.ok) {
        // Try to read error text from response for debugging
        let text = '';
        try { text = await response.text(); } catch (_) { /* ignore */ }
        throw new Error(`Status ${response.status} ${response.statusText}${text ? ': ' + text : ''}`);
      }

      const blob = await response.blob();

      // If server provided a filename via Content-Disposition, prefer it
      try {
        const cd = response.headers.get('content-disposition');
        if (cd) {
          const m = cd.match(/filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i);
          const extracted = m ? (m[1] || m[2]) : null;
          if (extracted) {
            // decode URI-encoded filename if needed
            const maybeDecoded = decodeURIComponent(extracted.replace(/"/g, ''));
            filename = maybeDecoded.replace(/[^a-zA-Z0-9 ._-]/g, '');
          }
        }
      } catch (err) {
        // ignore header parsing errors
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download error:', e);
      // Fallback: open the file URL in a new tab for quick debugging (may fail if auth/CORS required)
      try {
        if (fileUrl) window.open(fileUrl, '_blank');
      } catch (_) { /* ignore */ }
      
    }
  };

  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleResetPassword = async () => {
    setResetError('');
    setResetSuccess('');
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match!');
      return;
    }
    if (!currentPassword || !newPassword) {
      setResetError('Please fill all fields.');
      return;
    }
    setResetLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/password/change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setResetSuccess('Password reset successful!');
        setShowResetModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setResetError(data.message || 'Failed to reset password.');
      }
    } catch (e) {
      setResetError('Network error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>

      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold" href="#">
            <img src="/16.png" alt="Brand logo" />
          </a>
          <button
            className="btn btn-link text-white p-0 border-0 dropdown-toggle"
            type="button"
            id="profileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ fontSize: '1.5rem' }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
              <circle cx="20" cy="20" r="18" fill="white" fillOpacity="0.2"/>
              <path d="M20 4C11.16 4 4 11.16 4 20C4 28.84 11.16 36 20 36C28.84 36 36 28.84 36 20C36 11.16 28.84 4 20 4ZM20 10C22.76 10 25 12.24 25 15C25 17.76 22.76 20 20 20C17.24 20 15 17.76 15 15C15 12.24 17.24 10 20 10ZM20 32C16 32 12.42 29.84 10.5 26.64C10.54 23.33 17.33 21.5 20 21.5C22.66 21.5 29.46 23.33 29.5 26.64C27.58 29.84 24 32 20 32Z" fill="white"/>
            </svg>
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
            <li>
              <button className="dropdown-item" type="button" onClick={() => setShowResetModal(true)}>
                Reset Password
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button" onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-4 py-md-5">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-5 fw-bold text-dark mb-2">Documents</h1>
            <p className="text-muted">Access Your Documents</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : (
          <div className="row g-4">
            {documents.length === 0 ? (
              <div className="col-12 text-center text-muted">No documents found.</div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0 hover-card">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex align-items-start mb-3">
                        <span className="fs-2 me-3">📄</span>
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1">{doc.title.replace(/_/g, ' ')}</h5>
                          <p className="card-text text-muted small mb-0">{doc.category.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleView(doc)}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                            </svg>
                            View Document
                          </button>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleDownload(doc)}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Download Document
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowResetModal(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Reset Password</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowResetModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {resetError && (
                  <div className="alert alert-danger py-2" role="alert">{resetError}</div>
                )}
                {resetSuccess && (
                  <div className="alert alert-success py-2" role="alert">{resetSuccess}</div>
                )}
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowResetModal(false)}
                  disabled={resetLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}