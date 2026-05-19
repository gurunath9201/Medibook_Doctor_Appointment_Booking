import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Navbar() {
  const { user, logout, isPatient, isDoctor, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifCount, setNotifCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user, location.pathname])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      const unread = res.data.filter(n => !n.isRead)
      setNotifCount(unread.length)
      setNotifications(res.data.slice(0, 5))
    } catch (e) {}
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setNotifCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) {}
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin/dashboard'
    if (isDoctor()) return '/doctor/dashboard'
    return '/patient/dashboard'
  }

  return (
    <nav className="navbar navbar-expand-lg medibook-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-heart-pulse-fill me-2"></i>Medi<span>Book</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/doctors">Find Doctors</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About Us</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
          </ul>
          <ul className="navbar-nav align-items-center gap-2">
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <button className="btn btn-link nav-link position-relative p-2" data-bs-toggle="dropdown">
                    <i className="bi bi-bell-fill fs-5 text-white"></i>
                    {notifCount > 0 && (
                      <span className="notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                    )}
                  </button>
                  <div className="dropdown-menu dropdown-menu-end p-0" style={{ width: '340px', borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                      <strong>Notifications</strong>
                      {notifCount > 0 && (
                        <button className="btn btn-sm btn-link text-primary p-0" onClick={markAllRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          <i className="bi bi-bell-slash fs-2 d-block mb-2"></i>
                          No notifications
                        </div>
                      ) : notifications.map(n => (
                        <div key={n.id} className={`p-3 border-bottom ${!n.isRead ? 'bg-light' : ''}`}>
                          <div className="d-flex gap-2">
                            <i className="bi bi-circle-fill text-primary" style={{ fontSize: '0.5rem', marginTop: '6px', flexShrink: 0 }}></i>
                            <div>
                              <div className="fw-semibold small">{n.title}</div>
                              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{n.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>

                <li className="nav-item dropdown">
                  <button className="btn d-flex align-items-center gap-2" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '10px', padding: '0.4rem 1rem' }} data-bs-toggle="dropdown">
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="d-none d-md-block" style={{ fontWeight: '500', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.fullName}
                    </span>
                    <i className="bi bi-chevron-down small"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to={getDashboardLink()}>
                        <i className="bi bi-grid text-primary"></i> Dashboard
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-light text-primary fw-semibold px-3" style={{ borderRadius: '10px' }}>
                    Register Free
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}