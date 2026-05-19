import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import api from '../api/axios'

export default function Login() {
  const [form, setForm]           = useState({ email: '', password: '' })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const { login }                 = useAuth()
  const navigate                  = useNavigate()
  const { addToast }              = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data, res.data.token)
      addToast('Login Successful! Welcome back 👋', 'success')
      setTimeout(() => {
        const roles = res.data.roles
        if (roles.includes('ROLE_ADMIN'))        navigate('/admin/dashboard')
        else if (roles.includes('ROLE_DOCTOR'))  navigate('/doctor/dashboard')
        else                                     navigate('/patient/dashboard')
      }, 800)
    } catch (err) {
      addToast('Login Failed! Invalid email or password.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card mx-auto">
          <div className="text-center mb-4">
            <div className="auth-logo mb-2">
              <i className="bi bi-heart-pulse-fill me-2"></i>MediBook
            </div>
            <h4 className="fw-700 mb-1" style={{ fontWeight: '700' }}>Welcome Back</h4>
            <p className="text-muted small mb-0">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="medibook-form">
            <div className="mb-3">
              <label>Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="Enter Your Email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ borderRadius: '0 10px 10px 0' }}
                />
              </div>
            </div>

            <div className="mb-2">
              <label>Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="Enter Your Password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ borderRadius: '0' }}
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start-0"
                  onClick={() => setShowPass(p => !p)}
                  style={{ cursor: 'pointer', borderRadius: '0 10px 10px 0' }}
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
            </div>

            <div className="text-end mb-4">
              <Link to="/forgot-password" className="text-primary small text-decoration-none">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-medibook w-100 py-2 mb-3"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
                : <><i className="bi bi-box-arrow-in-right me-2"></i>Login</>
              }
            </button>
          </form>

          <div className="text-center small">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-600">Register Free</Link>
          </div>
        </div>
      </div>
    </div>
  )
}