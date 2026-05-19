import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import api from '../api/axios'

export default function ResetPassword() {
  const [searchParams]                    = useSearchParams()
  const token                             = searchParams.get('token')
  const [form, setForm]                   = useState({ password: '', confirmPassword: '' })
  const [showPass, setShowPass]           = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [loading, setLoading]             = useState(false)
  const [done, setDone]                   = useState(false)
  const { addToast }                      = useToast()
  const navigate                          = useNavigate()

  if (!token) {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="auth-card mx-auto text-center">
            <i className="bi bi-exclamation-triangle-fill text-warning fs-1 d-block mb-3"></i>
            <h5 className="fw-700">Invalid Reset Link</h5>
            <p className="text-muted small mb-4">This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="btn btn-medibook">Request New Link</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      addToast('Passwords do not match!', 'error')
      return
    }
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'warning')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.password })
      setDone(true)
      addToast('Password reset successfully!', 'success')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      addToast(err.response?.data?.message || 'Reset failed. Link may have expired.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="auth-card mx-auto text-center">
            <i className="bi bi-check-circle-fill text-success fs-1 d-block mb-3"></i>
            <h5 className="fw-700">Password Reset!</h5>
            <p className="text-muted small mb-4">Your password has been changed. Redirecting to login...</p>
            <Link to="/login" className="btn btn-medibook">Login Now</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card mx-auto">
          <div className="text-center mb-4">
            <div className="auth-logo mb-1"><i className="bi bi-heart-pulse-fill me-2"></i>MediBook</div>
            <h4 className="fw-700 mb-1" style={{ fontWeight: '700' }}>Reset Password</h4>
            <p className="text-muted small">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="medibook-form">
            <div className="mb-3">
              <label>New Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="Enter New Password"
                  style={{ borderRadius: '0' }}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required minLength={6}
                />
                <button type="button"
                  className="input-group-text bg-light border-start-0"
                  onClick={() => setShowPass(p => !p)}
                  style={{ cursor: 'pointer', borderRadius: '0 10px 10px 0' }}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label>Confirm New Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock-fill text-muted"></i>
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="Re-enter New Password"
                  style={{ borderRadius: '0' }}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                <button type="button"
                  className="input-group-text bg-light border-start-0"
                  onClick={() => setShowConfirm(p => !p)}
                  style={{ cursor: 'pointer', borderRadius: '0 10px 10px 0' }}>
                  <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-medibook w-100 py-2 mb-3" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Resetting...</>
                : <><i className="bi bi-shield-lock me-2"></i>Reset Password</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}