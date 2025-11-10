import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    // For PDFs, use Google Docs viewer to avoid forced download
    if (doc.mimeType === 'application/pdf' || (doc.fileUrl && doc.fileUrl.toLowerCase().endsWith('.pdf'))) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.fileUrl)}&embedded=true`;
      window.open(viewerUrl, '_blank');
    } else {
      window.open(doc.fileUrl, '_blank');
    }
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
    try {
      // Fetch as blob to ensure correct file type
      const response = await fetch(doc.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download file.');
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
                  <div className="input-group">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-control"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
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
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <div className="input-group">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-control"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
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
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
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