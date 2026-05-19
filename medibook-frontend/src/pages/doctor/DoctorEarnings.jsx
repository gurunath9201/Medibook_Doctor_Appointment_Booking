import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function DoctorSidebar({ active }) {
  const links = [
    { to: '/doctor/dashboard',    icon: 'bi-grid',           label: 'Dashboard' },
    { to: '/doctor/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { to: '/doctor/schedule',     icon: 'bi-clock',          label: 'My Schedule' },
    { to: '/doctor/earnings',     icon: 'bi-cash-stack',     label: 'Earnings' },
  ]
  return (
    <div className="dashboard-sidebar">
      <div className="text-muted small fw-600 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>
        Doctor Menu
      </div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${active === l.to ? 'active' : ''}`}>
          <i className={l.icon}></i>{l.label}
        </Link>
      ))}
    </div>
  )
}

export default function DoctorEarnings() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [monthFilter, setMonthFilter]   = useState('ALL')

  useEffect(() => {
    api.get('/doctor/appointments')
      .then(r => setAppointments(r.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  const completed = appointments.filter(a => a.status === 'COMPLETED')

  const today      = new Date().toISOString().split('T')[0]
  const thisMonth  = new Date().toISOString().slice(0, 7)
  const lastMonth  = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)

  const todayEarnings = completed
    .filter(a => a.appointmentDate === today)
    .reduce((s, a) => s + Number(a.doctor?.consultationFee || 0), 0)

  const monthEarnings = completed
    .filter(a => a.appointmentDate?.startsWith(thisMonth))
    .reduce((s, a) => s + Number(a.doctor?.consultationFee || 0), 0)

  const lastMonthEarnings = completed
    .filter(a => a.appointmentDate?.startsWith(lastMonth))
    .reduce((s, a) => s + Number(a.doctor?.consultationFee || 0), 0)

  const totalEarnings = completed
    .reduce((s, a) => s + Number(a.doctor?.consultationFee || 0), 0)

  const filteredCompleted = monthFilter === 'ALL'
    ? completed
    : completed.filter(a => a.appointmentDate?.startsWith(monthFilter))

  const stats = [
    { label: "Today's Earnings",  value: `₹${todayEarnings}`,     icon: 'bi-calendar-day',   color: '#0d6efd', border: '#0d6efd' },
    { label: 'This Month',        value: `₹${monthEarnings}`,     icon: 'bi-calendar-month', color: '#0d9488', border: '#0d9488' },
    { label: 'Last Month',        value: `₹${lastMonthEarnings}`, icon: 'bi-calendar3',      color: '#8b5cf6', border: '#8b5cf6' },
    { label: 'Total Earnings',    value: `₹${totalEarnings}`,     icon: 'bi-cash-stack',     color: '#f59e0b', border: '#f59e0b' },
  ]

  const months = [...new Set(completed.map(a => a.appointmentDate?.slice(0, 7)).filter(Boolean))].sort().reverse()

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-cash-stack me-3"></i>Earnings</h1>
          <p className="mb-0 opacity-75">Track your consultation revenue</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3">
            <DoctorSidebar active="/doctor/earnings" />
          </div>

          <div className="col-lg-9">
            <div className="row g-3 mb-4">
              {stats.map((s, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="stat-card" style={{ borderLeftColor: s.border }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-700 mb-1" style={{ color: s.color, fontSize: '1.3rem', fontWeight: '700' }}>
                          {s.value}
                        </div>
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

            <div className="medibook-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h6 className="fw-700 mb-0" style={{ fontWeight: '700' }}>
                  <i className="bi bi-table me-2 text-primary"></i>
                  Earnings History ({filteredCompleted.length} consultations)
                </h6>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '160px', borderRadius: '10px' }}
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                >
                  <option value="ALL">All Time</option>
                  {months.map(m => (
                    <option key={m} value={m}>
                      {new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="medibook-spinner py-4">
                  <div className="spinner-border text-primary" />
                </div>
              ) : filteredCompleted.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-cash-coin fs-1 d-block mb-3 opacity-50"></i>
                  <h6>No earnings yet</h6>
                  <p className="small">Complete appointments will appear here.</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table medibook-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Patient</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompleted.map(a => (
                          <tr key={a.id}>
                            <td>
                              <code className="text-primary" style={{ fontSize: '0.82rem' }}>
                                #{a.bookingId}
                              </code>
                            </td>
                            <td className="fw-600">{a.patient?.fullName}</td>
                            <td>{a.appointmentDate}</td>
                            <td>{a.appointmentTime?.slice(0, 5)}</td>
                            <td>
                              <span className="fw-700 text-success">
                                ₹{a.doctor?.consultationFee}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f8fafc' }}>
                          <td colSpan="4" className="fw-700 text-end pe-3">
                            {monthFilter === 'ALL' ? 'Total Earnings' : 'Month Total'}
                          </td>
                          <td className="fw-700 text-success fs-5">
                            ₹{filteredCompleted.reduce((s, a) => s + Number(a.doctor?.consultationFee || 0), 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-4 p-3 rounded-3" style={{ background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #e2e8f0' }}>
                    <div className="row g-3 text-center">
                      <div className="col-md-4">
                        <div className="small text-muted">Total Consultations</div>
                        <div className="fw-700 fs-5">{filteredCompleted.length}</div>
                      </div>
                      <div className="col-md-4">
                        <div className="small text-muted">Average per Consultation</div>
                        <div className="fw-700 fs-5 text-success">
                          ₹{filteredCompleted.length > 0
                            ? Math.round(filteredCompleted.reduce((s, a) => s + Number(a.doctor?.consultationFee || 0), 0) / filteredCompleted.length)
                            : 0}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="small text-muted">Total Revenue</div>
                        <div className="fw-700 fs-5 text-primary">
                          ₹{filteredCompleted.reduce((s, a) => s + Number(a.doctor?.consultationFee || 0), 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}