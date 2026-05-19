import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/Toast'
import api from '../api/axios'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const { addToast }          = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      addToast('Reset link sent! Check your email inbox.', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send reset email. Check the email address.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card mx-auto">
          <div className="text-center mb-4">
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#eff6ff,#e0f2fe)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-key-fill text-primary fs-3"></i>
            </div>
            <div className="auth-logo mb-1">
              <i className="bi bi-heart-pulse-fill me-2"></i>MediBook
            </div>
            <h4 className="fw-700 mb-1" style={{ fontWeight: '700' }}>Forgot Password?</h4>
            <p className="text-muted small mb-0">Enter your email to receive a reset link</p>
          </div>

          {sent ? (
            <div className="text-center py-3">
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#f0fdf4', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-envelope-check-fill text-success" style={{ fontSize: '2rem' }}></i>
              </div>
              <h5 className="fw-700 mb-2">Email Sent!</h5>
              <p className="text-muted small mb-4">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and spam folder.
              </p>
              <button className="btn btn-outline-primary w-100 mb-3" style={{ borderRadius: '10px' }}
                onClick={() => { setSent(false); setEmail('') }}>
                <i className="bi bi-arrow-left me-2"></i>Send Again
              </button>
              <Link to="/login" className="btn btn-medibook w-100" style={{ borderRadius: '10px' }}>
                <i className="bi bi-box-arrow-in-right me-2"></i>Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="medibook-form">
              <div className="mb-4">
                <label>Email Address *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ borderRadius: '0 10px 10px 0' }}
                  />
                </div>
                <div className="form-text">
                  <i className="bi bi-info-circle me-1"></i>
                  Enter the email registered with your MediBook account
                </div>
              </div>

              <button type="submit" className="btn btn-medibook w-100 py-2 mb-3" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                  : <><i className="bi bi-send me-2"></i>Send Reset Link</>
                }
              </button>

              <div className="text-center">
                <Link to="/login" className="text-muted small text-decoration-none">
                  <i className="bi bi-arrow-left me-1"></i>Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}