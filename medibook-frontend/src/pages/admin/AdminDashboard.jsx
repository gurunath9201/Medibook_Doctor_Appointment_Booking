import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function AdminSidebar({ active }) {
  const links = [
    { to: '/admin/dashboard', icon: 'bi-grid', label: 'Dashboard' },
    { to: '/admin/doctors', icon: 'bi-person-badge', label: 'Manage Doctors' },
    { to: '/admin/appointments', icon: 'bi-calendar-check', label: 'All Appointments' },
  ]
  return (
    <div className="dashboard-sidebar">
      <div className="text-muted small fw-600 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Admin Menu</div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${active === l.to ? 'active' : ''}`}>
          <i className={l.icon}></i>{l.label}
        </Link>
      ))}
    </div>
  )
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/doctors/pending')
    ]).then(([sRes, pRes]) => {
      setStats(sRes.data)
      setPendingDoctors(pRes.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const approveDoctor = async (id) => {
    try {
      await api.put(`/admin/doctors/${id}/approve`)
      setPendingDoctors(prev => prev.filter(d => d.id !== id))
      alert('Doctor approved successfully!')
    } catch (e) { alert('Approval failed') }
  }

  const rejectDoctor = async (id) => {
    if (!window.confirm('Reject this doctor?')) return
    try {
      await api.put(`/admin/doctors/${id}/reject`)
      setPendingDoctors(prev => prev.filter(d => d.id !== id))
    } catch (e) { alert('Rejection failed') }
  }

  const statCards = stats ? [
    { label: 'Total Patients', value: stats.totalPatients || 0, icon: 'bi-people-fill', color: '#0d6efd', border: '#0d6efd' },
    { label: 'Total Doctors', value: stats.totalDoctors || 0, icon: 'bi-person-badge-fill', color: '#0d9488', border: '#0d9488' },
    { label: 'Total Appointments', value: stats.totalAppointments || 0, icon: 'bi-calendar-check-fill', color: '#8b5cf6', border: '#8b5cf6' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, icon: 'bi-cash-stack', color: '#f59e0b', border: '#f59e0b' },
  ] : []

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-speedometer2 me-3"></i>Admin Dashboard</h1>
          <p className="mb-0 opacity-75">Platform Overview & Management</p>
        </div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><AdminSidebar active="/admin/dashboard" /></div>
          <div className="col-lg-9">
            {loading ? (
              <div className="medibook-spinner"><div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} /></div>
            ) : (
              <>
                <div className="row g-3 mb-4">
                  {statCards.map((s, i) => (
                    <div key={i} className="col-6 col-md-3">
                      <div className="stat-card" style={{ borderLeftColor: s.border }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="stat-number mb-1" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-muted small">{s.label}</div>
                          </div>
                          <div className="stat-icon" style={{ background: s.color + '15' }}>
                            <i className={s.icon} style={{ color: s.color }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="medibook-card p-4 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="fw-700 mb-0">
                      <i className="bi bi-person-check me-2 text-warning"></i>
                      Pending Doctor Approvals
                      {pendingDoctors.length > 0 && (
                        <span className="badge bg-warning text-dark ms-2">{pendingDoctors.length}</span>
                      )}
                    </h6>
                    <Link to="/admin/doctors" className="btn btn-sm btn-outline-primary" style={{ borderRadius: '8px' }}>View All</Link>
                  </div>

                  {pendingDoctors.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-check-circle fs-2 d-block mb-2 text-success"></i>
                      No pending approvals
                    </div>
                  ) : pendingDoctors.slice(0, 5).map(d => (
                    <div key={d.id} className="appointment-card mb-3">
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#0d6efd,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>
                          {d.user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-700">Dr. {d.user?.fullName}</div>
                          <div className="small text-muted">
                            {d.specializations?.map(s => s.name).join(', ')} • {d.qualification} • {d.experienceYears} yrs
                          </div>
                          <div className="small text-muted">{d.user?.email}</div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success" style={{ borderRadius: '8px' }} onClick={() => approveDoctor(d.id)}>
                            <i className="bi bi-check-lg me-1"></i>Approve
                          </button>
                          <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: '8px' }} onClick={() => rejectDoctor(d.id)}>
                            <i className="bi bi-x-lg me-1"></i>Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="medibook-card p-4">
                  <h6 className="fw-700 mb-3">Quick Actions</h6>
                  <div className="row g-3">
                    {[
                      { to: '/admin/doctors', icon: 'bi-person-badge', label: 'Manage Doctors', desc: 'Approve, reject, view all doctors', color: '#0d6efd' },
                      { to: '/admin/appointments', icon: 'bi-calendar-check', label: 'All Appointments', desc: 'View and manage all bookings', color: '#0d9488' },
                    ].map(q => (
                      <div key={q.to} className="col-md-6">
                        <Link to={q.to} className="text-decoration-none">
                          <div className="p-4 rounded-3 border h-100" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.background = q.color + '08' }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
                            <i className={`${q.icon} fs-2 mb-3 d-block`} style={{ color: q.color }}></i>
                            <div className="fw-700 mb-1">{q.label}</div>
                            <div className="text-muted small">{q.desc}</div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export function ManageDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/doctors').then(r => setDoctors(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const approveDoctor = async (id) => {
    try {
      await api.put(`/admin/doctors/${id}/approve`)
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, isApproved: true } : d))
    } catch (e) { alert('Failed') }
  }

  const toggleAvailability = async (id, current) => {
    try {
      await api.put(`/admin/doctors/${id}/toggle-availability`)
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, isAvailable: !current } : d))
    } catch (e) { alert('Failed') }
  }

  const filtered = doctors.filter(d => {
    const matchSearch = search === '' || d.user?.fullName?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || (filter === 'APPROVED' && d.isApproved) || (filter === 'PENDING' && !d.isApproved)
    return matchSearch && matchFilter
  })

  return (
    <>
      <div className="page-header">
        <div className="container"><h1>Manage Doctors</h1></div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><AdminSidebar active="/admin/doctors" /></div>
          <div className="col-lg-9">
            <div className="medibook-card p-4">
              {/* Filters */}
              <div className="d-flex gap-3 align-items-center mb-4 flex-wrap">
                <input type="text" className="form-control" style={{ maxWidth: '250px', borderRadius: '10px' }}
                  placeholder="Search doctor..." value={search} onChange={e => setSearch(e.target.value)} />
                <div className="d-flex gap-2">
                  {['ALL', 'APPROVED', 'PENDING'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ borderRadius: '20px' }} onClick={() => setFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="medibook-spinner"><div className="spinner-border text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-person-x fs-1 d-block mb-3"></i>No doctors found
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table medibook-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th>Fee</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(d => (
                        <tr key={d.id}>
                          <td>
                            <div className="fw-600">Dr. {d.user?.fullName}</div>
                            <div className="small text-muted">{d.user?.email}</div>
                            <div className="small text-muted">{d.qualification} • {d.experienceYears} yrs</div>
                          </td>
                          <td>
                            {d.specializations?.slice(0, 2).map(s => (
                              <span key={s.id} className="spec-badge d-block mb-1">{s.name}</span>
                            ))}
                          </td>
                          <td className="fw-700 text-success">₹{d.consultationFee}</td>
                          <td>
                            {d.isApproved ? (
                              <span className="status-badge status-confirmed">Approved</span>
                            ) : (
                              <span className="status-badge status-pending">Pending</span>
                            )}
                            <br />
                            <small className={d.isAvailable ? 'text-success' : 'text-muted'}>
                              {d.isAvailable ? '● Available' : '○ Unavailable'}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {!d.isApproved && (
                                <button className="btn btn-sm btn-success" style={{ borderRadius: '7px' }} onClick={() => approveDoctor(d.id)}>
                                  <i className="bi bi-check me-1"></i>Approve
                                </button>
                              )}
                              <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '7px' }}
                                onClick={() => toggleAvailability(d.id, d.isAvailable)}>
                                {d.isAvailable ? 'Disable' : 'Enable'}
                              </button>
                            </div>
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

export function AllAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/appointments').then(r => setAppointments(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const statusClass = {
    PENDING: 'status-pending', CONFIRMED: 'status-confirmed',
    COMPLETED: 'status-completed', CANCELLED: 'status-cancelled', NO_SHOW: 'status-no_show'
  }

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'ALL' || a.status === filter
    const matchSearch = search === '' ||
      a.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.bookingId?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const revenue = appointments.filter(a => a.status === 'COMPLETED')
    .reduce((s, a) => s + (a.doctor?.consultationFee || 0), 0)

  return (
    <>
      <div className="page-header">
        <div className="container"><h1>All Appointments</h1></div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><AdminSidebar active="/admin/appointments" /></div>
          <div className="col-lg-9">
            {/* Summary */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Total', value: appointments.length, color: '#0d6efd' },
                { label: 'Confirmed', value: appointments.filter(a => a.status === 'CONFIRMED').length, color: '#22c55e' },
                { label: 'Completed', value: appointments.filter(a => a.status === 'COMPLETED').length, color: '#8b5cf6' },
                { label: 'Revenue', value: `₹${revenue}`, color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="bg-white rounded-3 p-3 text-center shadow-sm border">
                    <div className="fw-700 fs-4" style={{ color: s.color }}>{s.value}</div>
                    <div className="small text-muted">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="medibook-card p-4">
              <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
                <input type="text" className="form-control" style={{ maxWidth: '250px', borderRadius: '10px' }}
                  placeholder="Search patient, doctor..." value={search} onChange={e => setSearch(e.target.value)} />
                <div className="d-flex gap-2 flex-wrap">
                  {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ borderRadius: '20px' }} onClick={() => setFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="medibook-spinner"><div className="spinner-border text-primary" /></div>
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
                        <tr><td colSpan="6" className="text-center text-muted py-4">No appointments found</td></tr>
                      ) : filtered.map(a => (
                        <tr key={a.id}>
                          <td><code className="text-primary small">#{a.bookingId}</code></td>
                          <td>
                            <div className="fw-600 small">{a.patient?.fullName}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{a.patient?.email}</div>
                          </td>
                          <td>
                            <div className="fw-600 small">Dr. {a.doctor?.user?.fullName}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{a.doctor?.specializations?.[0]?.name}</div>
                          </td>
                          <td>
                            <div className="small fw-500">{a.appointmentDate}</div>
                            <div className="small text-muted">{a.appointmentTime?.slice(0, 5)}</div>
                          </td>
                          <td className="fw-700 text-success">₹{a.doctor?.consultationFee}</td>
                          <td><span className={`status-badge ${statusClass[a.status] || ''}`}>{a.status}</span></td>
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

export default AdminDashboard