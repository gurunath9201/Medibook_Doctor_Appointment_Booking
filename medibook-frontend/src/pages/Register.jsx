import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import api from '../api/axios'

export default function Register() {
  const [form, setForm]             = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '', city: '', state: '' })
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]       = useState(false)
  const navigate                    = useNavigate()
  const { addToast }                = useToast()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

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
      await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        city: form.city,
        state: form.state,
      })
      addToast('Account created successfully! Please login.', 'success')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const STATES = ['Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat','Rajasthan','Uttar Pradesh','West Bengal','Telangana','Punjab']

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card mx-auto" style={{ maxWidth: '540px' }}>
          <div className="text-center mb-4">
            <div className="auth-logo mb-2">
              <i className="bi bi-heart-pulse-fill me-2"></i>MediBook
            </div>
            <h4 className="fw-700 mb-1" style={{ fontWeight: '700' }}>Create Account</h4>
            <p className="text-muted small mb-0">Register as a patient — free!</p>
          </div>

          <form onSubmit={handleSubmit} className="medibook-form">
            <div className="row g-3">
              <div className="col-12">
                <label>Full Name*</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-person text-muted"></i>
                  </span>
                  <input type="text" className="form-control border-start-0 ps-0"
                    placeholder="Enter Full Name" style={{ borderRadius: '0 10px 10px 0' }}
                    value={form.fullName} onChange={set('fullName')} required />
                </div>
              </div>

              <div className="col-md-6">
                <label>Email*</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input type="email" className="form-control border-start-0 ps-0"
                    placeholder="Enter Your Email" style={{ borderRadius: '0 10px 10px 0' }}
                    value={form.email} onChange={set('email')} required />
                </div>
              </div>

              <div className="col-md-6">
                <label>Phone</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-telephone text-muted"></i>
                  </span>
                  <input type="number" className="form-control border-start-0 ps-0"
                    placeholder="Enter Your Phone" style={{ borderRadius: '0 10px 10px 0' }}
                    value={form.phone} onChange={set('phone')} />
                </div>
              </div>

              {/* Password with Eye */}
              <div className="col-md-6">
                <label>Password *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-muted"></i>
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="Enter Minimum 6 characters"
                    style={{ borderRadius: '0' }}
                    value={form.password} onChange={set('password')} required minLength={6}
                  />
                  <button type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={() => setShowPass(p => !p)}
                    style={{ cursor: 'pointer', borderRadius: '0 10px 10px 0' }}>
                    <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password with Eye */}
              <div className="col-md-6">
                <label>Confirm Password *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock-fill text-muted"></i>
                  </span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="Re-enter password"
                    style={{ borderRadius: '0' }}
                    value={form.confirmPassword} onChange={set('confirmPassword')} required
                  />
                  <button type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={() => setShowConfirm(p => !p)}
                    style={{ cursor: 'pointer', borderRadius: '0 10px 10px 0' }}>
                    <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                  </button>
                </div>
              </div>

              <div className="col-md-6">
                <label>City</label>
                <input type="text" className="form-control" placeholder="Enter City"
                  value={form.city} onChange={set('city')} />
              </div>

              <div className="col-md-6">
                <label>State</label>
                <select className="form-select" value={form.state} onChange={set('state')}>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="col-12">
                <button type="submit" className="btn btn-medibook w-100 py-2" disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
                    : <><i className="bi bi-person-plus me-2"></i>Create Account</>
                  }
                </button>
              </div>
            </div>
          </form>

          <hr />
          <div className="text-center small">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-600">Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}