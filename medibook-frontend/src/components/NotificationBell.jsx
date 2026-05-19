import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      const data = res.data || []
      setNotifications(data.slice(0, 6))
      setUnreadCount(data.filter(n => !n.isRead).length)
    } catch (e) {
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) {}
  }

  const markOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {}
  }

  const typeIcon = {
    BOOKING_CONFIRMED: { icon: 'bi-calendar-check', color: '#22c55e' },
    BOOKING_CANCELLED: { icon: 'bi-calendar-x', color: '#ef4444' },
    REMINDER_24HR:     { icon: 'bi-clock', color: '#f59e0b' },
    REMINDER_1HR:      { icon: 'bi-alarm', color: '#f97316' },
    PAYMENT_SUCCESS:   { icon: 'bi-credit-card', color: '#0d6efd' },
    REVIEW_RECEIVED:   { icon: 'bi-star', color: '#8b5cf6' },
    GENERAL:           { icon: 'bi-info-circle', color: '#6b7280' },
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / 60000)
    if (diff < 1) return 'just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  if (!user) return null

  return (
    <div className="dropdown">
      <button
        className="btn position-relative p-2"
        style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', border: 'none', color: '#fff' }}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        onClick={fetchNotifications}
      >
        <i className="bi bi-bell-fill fs-5"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute"
            style={{
              top: '4px', right: '4px',
              background: '#ef4444', color: '#fff',
              borderRadius: '50%', width: '18px', height: '18px',
              fontSize: '0.65rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', lineHeight: 1
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div
        className="dropdown-menu dropdown-menu-end p-0 shadow"
        style={{ width: '360px', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
             style={{ background: '#f8fafc' }}>
          <span className="fw-700" style={{ fontWeight: '700' }}>
            Notifications
            {unreadCount > 0 && (
              <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>{unreadCount}</span>
            )}
          </span>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-link text-primary p-0 text-decoration-none"
                    style={{ fontSize: '0.8rem' }} onClick={markAllRead}>
              Mark all read
            </button>
          )}
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bell-slash fs-2 d-block mb-2 opacity-50"></i>
              <span style={{ fontSize: '0.85rem' }}>No notifications yet</span>
            </div>
          ) : notifications.map(n => {
            const t = typeIcon[n.type] || typeIcon.GENERAL
            return (
              <div
                key={n.id}
                className="d-flex gap-3 px-3 py-2 border-bottom"
                style={{
                  background: n.isRead ? '#fff' : '#eff6ff',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onClick={() => !n.isRead && markOneRead(n.id)}
              >
                <div
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: t.color + '18', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}
                >
                  <i className={`${t.icon}`} style={{ color: t.color, fontSize: '0.95rem' }}></i>
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-600" style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                    {n.title}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.76rem', lineHeight: 1.4 }}>
                    {n.message}
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                    {formatTime(n.createdAt)}
                  </div>
                </div>
                {!n.isRead && (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#0d6efd', flexShrink: 0, marginTop: '6px'
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}