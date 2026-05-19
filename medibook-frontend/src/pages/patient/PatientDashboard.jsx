import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

function PatientSidebar({ active }) {
  const links = [
    { to: '/patient/dashboard', icon: 'bi-grid', label: 'Dashboard' },
    { to: '/patient/appointments', icon: 'bi-calendar-check', label: 'My Appointments' },
    { to: '/patient/medical-history', icon: 'bi-file-medical', label: 'Medical History' },
    { to: '/patient/family', icon: 'bi-people', label: 'Family Members' },
    { to: '/doctors', icon: 'bi-search-heart', label: 'Find Doctors' },
  ]
  return (
    <div className="dashboard-sidebar">
      <div className="text-muted small fw-600 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Patient Menu</div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${active === l.to ? 'active' : ''}`}>
          <i className={l.icon}></i>{l.label}
        </Link>
      ))}
    </div>
  )
}

const STATUS_CLASS = {
  PENDING:'status-pending', CONFIRMED:'status-confirmed',
  COMPLETED:'status-completed', CANCELLED:'status-cancelled', NO_SHOW:'status-no_show',
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/appointments/my')
      .then(r => setAppointments(r.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  const upcoming  = appointments.filter(a => ['PENDING','CONFIRMED'].includes(a.status))
  const completed = appointments.filter(a => a.status === 'COMPLETED')
  const cancelled = appointments.filter(a => a.status === 'CANCELLED')

  const stats = [
    { label:'Total Bookings',  value: appointments.length, icon:'bi-calendar-check', color:'#0d6efd', border:'#0d6efd' },
    { label:'Upcoming',        value: upcoming.length,     icon:'bi-clock',          color:'#0d9488', border:'#0d9488' },
    { label:'Completed',       value: completed.length,    icon:'bi-check-circle',   color:'#8b5cf6', border:'#8b5cf6' },
    { label:'Cancelled',       value: cancelled.length,    icon:'bi-x-circle',       color:'#ef4444', border:'#ef4444' },
  ]

  const quickActions = [
    { to:'/doctors',                   icon:'bi-search-heart',  label:'Find Doctor',      desc:'Search by specialization', color:'#0d6efd' },
    { to:'/patient/medical-history',   icon:'bi-file-medical',  label:'Medical Records',  desc:'View past prescriptions',  color:'#0d9488' },
    { to:'/patient/family',            icon:'bi-people',         label:'Family Members',   desc:'Book for family',          color:'#8b5cf6' },
  ]

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-grid me-3"></i>Patient Dashboard</h1>
          <p className="mb-0 opacity-75">Welcome back, {user?.fullName}!</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><PatientSidebar active="/patient/dashboard" /></div>
          <div className="col-lg-9">

            {/* Stats */}
            <div className="row g-3 mb-4">
              {stats.map((s, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="stat-card" style={{ borderLeftColor: s.border }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="stat-number mb-1" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-muted small">{s.label}</div>
                      </div>
                      <div className="stat-icon" style={{ background: s.color+'15' }}>
                        <i className={s.icon} style={{ color: s.color }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="medibook-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-700 mb-0" style={{ fontWeight:'700' }}>
                  <i className="bi bi-clock me-2 text-primary"></i>Upcoming Appointments
                </h6>
                <Link to="/patient/appointments" className="btn btn-sm btn-outline-primary" style={{ borderRadius:'8px' }}>
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="d-flex justify-content-center py-3">
                  <div className="spinner-border text-primary spinner-border-sm" />
                </div>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-x fs-2 d-block mb-2 opacity-50"></i>
                  <p className="small mb-3">No upcoming appointments</p>
                  <Link to="/doctors" className="btn btn-primary btn-sm" style={{ borderRadius:'8px' }}>
                    <i className="bi bi-plus-circle me-2"></i>Book Now
                  </Link>
                </div>
              ) : upcoming.slice(0, 4).map(a => (
                <div key={a.id} className="appointment-card mb-2 d-flex align-items-center gap-3 flex-wrap">
                  <div style={{ width:'42px',height:'42px',borderRadius:'12px',background:'linear-gradient(135deg,#eff6ff,#e0f2fe)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <i className="bi bi-person-circle text-primary" style={{ fontSize:'1.3rem' }}></i>
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-600 small text-truncate">Dr. {a.doctor?.user?.fullName}</div>
                    <div className="text-muted" style={{ fontSize:'0.78rem' }}>
                      <i className="bi bi-calendar3 me-1"></i>{a.appointmentDate}
                      <i className="bi bi-clock ms-2 me-1"></i>{a.appointmentTime?.slice(0,5)}
                    </div>
                  </div>
                  <span className={`status-badge ${STATUS_CLASS[a.status]||''}`}>{a.status}</span>
                  <div className="text-end">
                    <div className="small text-muted">#{a.bookingId}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="medibook-card p-4">
              <h6 className="fw-700 mb-3" style={{ fontWeight:'700' }}>
                <i className="bi bi-lightning me-2 text-warning"></i>Quick Actions
              </h6>
              <div className="row g-3">
                {quickActions.map(q => (
                  <div key={q.to} className="col-md-4">
                    <Link to={q.to} className="text-decoration-none">
                      <div className="p-3 rounded-3 border text-center h-100"
                           style={{ cursor:'pointer', transition:'all 0.2s' }}
                           onMouseOver={e => { e.currentTarget.style.borderColor=q.color; e.currentTarget.style.background=q.color+'08' }}
                           onMouseOut={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#fff' }}>
                        <div style={{ width:'50px',height:'50px',borderRadius:'14px',background:q.color+'12',margin:'0 auto 0.75rem',display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <i className={`${q.icon} fs-3`} style={{ color:q.color }}></i>
                        </div>
                        <div className="fw-600 small mb-1">{q.label}</div>
                        <div className="text-muted" style={{ fontSize:'0.76rem' }}>{q.desc}</div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}