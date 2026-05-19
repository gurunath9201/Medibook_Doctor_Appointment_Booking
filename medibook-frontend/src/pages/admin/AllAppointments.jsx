import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function AdminSidebar({ active }) {
  const links = [
    { to: '/admin/dashboard',    icon: 'bi-grid',           label: 'Dashboard' },
    { to: '/admin/doctors',      icon: 'bi-person-badge',   label: 'Manage Doctors' },
    { to: '/admin/appointments', icon: 'bi-calendar-check', label: 'All Appointments' },
  ]
  return (
    <div className="dashboard-sidebar">
      <div className="text-muted small fw-600 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>
        Admin Menu
      </div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${active === l.to ? 'active' : ''}`}>
          <i className={l.icon}></i>{l.label}
        </Link>
      ))}
    </div>
  )
}

const STATUS_CLASS = {
  PENDING:    'status-pending',
  CONFIRMED:  'status-confirmed',
  COMPLETED:  'status-completed',
  CANCELLED:  'status-cancelled',
  NO_SHOW:    'status-no_show',
}

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('ALL')
  const [search, setSearch]             = useState('')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')

  useEffect(() => {
    api.get('/admin/appointments')
      .then(r => setAppointments(r.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'ALL' || a.status === filter
    const matchSearch = search === '' ||
      a.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.bookingId?.toLowerCase().includes(search.toLowerCase())
    const matchFrom = !dateFrom || a.appointmentDate >= dateFrom
    const matchTo   = !dateTo   || a.appointmentDate <= dateTo
    return matchFilter && matchSearch && matchFrom && matchTo
  })

  const totalRevenue = appointments
    .filter(a => a.status === 'COMPLETED')
    .reduce((s, a) => s + Number(a.doctor?.consultationFee || 0), 0)

  const summaryStats = [
    { label: 'Total',     value: appointments.length,                                             color: '#0d6efd' },
    { label: 'Pending',   value: appointments.filter(a => a.status === 'PENDING').length,         color: '#f59e0b' },
    { label: 'Confirmed', value: appointments.filter(a => a.status === 'CONFIRMED').length,       color: '#22c55e' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'COMPLETED').length,       color: '#8b5cf6' },
    { label: 'Cancelled', value: appointments.filter(a => a.status === 'CANCELLED').length,       color: '#ef4444' },
    { label: 'Revenue',   value: `₹${totalRevenue}`,                                              color: '#0d9488' },
  ]

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-calendar-check me-3"></i>All Appointments</h1>
          <p className="mb-0 opacity-75">View and manage all platform appointments</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3">
            <AdminSidebar active="/admin/appointments" />
          </div>

          <div className="col-lg-9">
            <div className="row g-2 mb-4">
              {summaryStats.map((s, i) => (
                <div key={i} className="col-6 col-md-2">
                  <div className="bg-white rounded-3 p-3 text-center border" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div className="fw-700" style={{ color: s.color, fontSize: '1.2rem', fontWeight: '700' }}>
                      {s.value}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="medibook-card p-4">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Patient, doctor, booking ID..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ borderRadius: '0 10px 10px 0' }}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="From"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="To"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div className="col-md-4">
                  <div className="d-flex gap-1 flex-wrap">
                    {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
                      <button
                        key={f}
                        className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ borderRadius: '20px', fontSize: '0.78rem' }}
                        onClick={() => setFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="small text-muted mb-3">
                Showing {filtered.length} of {appointments.length} appointments
              </div>

              {loading ? (
                <div className="medibook-spinner py-4">
                  <div className="spinner-border text-primary" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table medibook-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-5">
                            <i className="bi bi-calendar-x fs-2 d-block mb-2 opacity-50"></i>
                            No appointments found
                          </td>
                        </tr>
                      ) : filtered.map(a => (
                        <tr key={a.id}>
                          <td>
                            <code className="text-primary" style={{ fontSize: '0.78rem' }}>
                              #{a.bookingId}
                            </code>
                          </td>
                          <td>
                            <div className="fw-600 small">{a.patient?.fullName}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {a.patient?.phone || a.patient?.email}
                            </div>
                          </td>
                          <td>
                            <div className="fw-600 small">Dr. {a.doctor?.user?.fullName}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {a.doctor?.specializations?.[0]?.name}
                            </div>
                          </td>
                          <td>
                            <div className="small fw-500">{a.appointmentDate}</div>
                            <div className="small text-muted">{a.appointmentTime?.slice(0, 5)}</div>
                          </td>
                          <td className="fw-700 text-success small">
                            ₹{a.doctor?.consultationFee}
                          </td>
                          <td>
                            <span className={`status-badge ${STATUS_CLASS[a.status] || ''}`}
                                  style={{ fontSize: '0.7rem' }}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}