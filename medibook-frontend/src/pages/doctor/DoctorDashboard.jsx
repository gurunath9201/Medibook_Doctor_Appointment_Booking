import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { StarRatingDisplay } from '../../components/StarRating'

function DoctorSidebar({ active }) {
  const links = [
    { to: '/doctor/dashboard', icon: 'bi-grid', label: 'Dashboard' },
    { to: '/doctor/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { to: '/doctor/schedule', icon: 'bi-clock', label: 'My Schedule' },
    { to: '/doctor/earnings', icon: 'bi-cash-stack', label: 'Earnings' },
  ]
  return (
    <div className="dashboard-sidebar">
      <div className="text-muted small fw-600 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Doctor Menu</div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${active === l.to ? 'active' : ''}`}>
          <i className={l.icon}></i>{l.label}
        </Link>
      ))}
    </div>
  )
}

export function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, profileRes] = await Promise.all([
          api.get('/doctor/appointments'),
          api.get('/doctor/profile')
        ])
        setAppointments(aptRes.data || [])
        setProfile(profileRes.data)
      } catch (e) {
        console.error('Error loading doctor data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointmentDate === today)
  const upcoming = appointments.filter(a => a.appointmentDate >= today && ['CONFIRMED', 'PENDING'].includes(a.status))
  const completed = appointments.filter(a => a.status === 'COMPLETED')

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: 'bi-calendar-day', color: '#0d6efd' },
    { label: 'Upcoming', value: upcoming.length, icon: 'bi-clock', color: '#0d9488' },
    { label: 'Completed', value: completed.length, icon: 'bi-check-circle', color: '#8b5cf6' },
    { label: 'Total Patients', value: appointments.length, icon: 'bi-people', color: '#f59e0b' },
  ]

  const statusClass = {
    PENDING: 'status-pending', CONFIRMED: 'status-confirmed',
    COMPLETED: 'status-completed', CANCELLED: 'status-cancelled', NO_SHOW: 'status-no_show'
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/doctor/appointments/${id}/status`, { status })
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (e) { alert('Failed to update status') }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Doctor Dashboard</h1>
          <p className="mb-0 opacity-75">Welcome, Dr. {user?.fullName}</p>
        </div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><DoctorSidebar active="/doctor/dashboard" /></div>
          <div className="col-lg-9">
            {profile && (
              <div className="medibook-card p-4 mb-4">
                <div className="d-flex align-items-center gap-4 flex-wrap">
                  <div className="doctor-avatar-placeholder" style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}>
                    {profile.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="fw-700 mb-1">Dr. {profile.fullName}</h4>
                    <div className="text-muted">{profile.specializations?.join(', ') || 'N/A'}</div>
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <StarRatingDisplay value={profile.averageRating} showCount count={profile.totalReviews} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row g-3 mb-4">
              {stats.map((s, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="stat-card" style={{ borderLeftColor: s.color }}>
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-700 mb-0">
                  <i className="bi bi-calendar-day me-2 text-primary"></i>Today's Appointments
                </h6>
                <span className="badge bg-primary">{todayAppts.length}</span>
              </div>
              {loading ? (
                <div className="medibook-spinner"><div className="spinner-border text-primary spinner-border-sm" /></div>
              ) : todayAppts.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>No appointments today
                </div>
              ) : todayAppts.map(a => (
                <div key={a.id} className="appointment-card mb-3">
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="bi bi-person text-primary fs-4"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-600">{a.patient?.fullName}</div>
                      <div className="small text-muted">
                        <i className="bi bi-clock me-1"></i>{a.appointmentTime?.slice(0, 5)} &nbsp;
                        <i className="bi bi-chat-text me-1"></i>{a.reasonForVisit?.slice(0, 40)}...
                      </div>
                    </div>
                    <span className={`status-badge ${statusClass[a.status]}`}>{a.status}</span>
                    <div className="d-flex gap-2">
                      {a.status === 'CONFIRMED' && (
                        <>
                          <button className="btn btn-sm btn-success" style={{ borderRadius: '8px' }}
                            onClick={() => updateStatus(a.id, 'COMPLETED')}>
                            <i className="bi bi-check me-1"></i>Complete
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '8px' }}
                            onClick={() => updateStatus(a.id, 'NO_SHOW')}>
                            No Show
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="medibook-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-700 mb-0">
                  <i className="bi bi-calendar3 me-2 text-success"></i>Upcoming (Next 7 Days)
                </h6>
                <Link to="/doctor/appointments" className="btn btn-sm btn-outline-primary" style={{ borderRadius: '8px' }}>View All</Link>
              </div>
              {upcoming.slice(0, 5).map(a => (
                <div key={a.id} className="d-flex align-items-center gap-3 p-3 border-bottom">
                  <div className="text-center" style={{ minWidth: '60px' }}>
                    <div className="fw-700 text-primary" style={{ fontSize: '1.2rem' }}>
                      {new Date(a.appointmentDate).getDate()}
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.7rem' }}>
                      {new Date(a.appointmentDate).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-600">{a.patient?.fullName}</div>
                    <div className="small text-muted">{a.appointmentTime?.slice(0, 5)} • {a.reasonForVisit?.slice(0, 30)}</div>
                  </div>
                  <span className={`status-badge ${statusClass[a.status]}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function ScheduleManager() {
  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [leaveDate, setLeaveDate] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveMsg, setLeaveMsg] = useState('')

  const defaultSched = DAYS.reduce((acc, d) => ({
    ...acc,
    [d]: { enabled: false, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxPatients: 20 }
  }), {})
  const [form, setForm] = useState(defaultSched)

  useEffect(() => {
    api.get('/doctor/schedule').then(r => {
      const data = r.data || []
      const updated = { ...defaultSched }
      data.forEach(s => {
        updated[s.dayOfWeek] = {
          enabled: s.isActive,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDurationMinutes: s.slotDurationMinutes,
          maxPatients: s.maxPatients
        }
      })
      setForm(updated)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const saveSchedule = async () => {
    setSaving(true)
    try {
      const scheduleList = DAYS.filter(d => form[d].enabled).map(d => ({
        dayOfWeek: d,
        startTime: form[d].startTime,
        endTime: form[d].endTime,
        slotDurationMinutes: form[d].slotDurationMinutes,
        maxPatients: form[d].maxPatients,
        isActive: true
      }))
      await api.post('/doctor/schedule', { schedules: scheduleList })
      alert('Schedule saved successfully!')
    } catch (e) { alert('Failed to save schedule') }
    finally { setSaving(false) }
  }

  const addLeave = async (e) => {
    e.preventDefault()
    try {
      await api.post('/doctor/leave', { leaveDate, reason: leaveReason })
      setLeaveMsg('Leave marked successfully!')
      setLeaveDate('')
      setLeaveReason('')
    } catch (e) { setLeaveMsg('Failed to mark leave') }
  }

  const setDay = (day, field, value) => {
    setForm(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  if (loading) return <div className="medibook-spinner"><div className="spinner-border text-primary" /></div>

  return (
    <>
      <div className="page-header">
        <div className="container"><h1>Schedule Manager</h1></div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><DoctorSidebar active="/doctor/schedule" /></div>
          <div className="col-lg-9">

            <div className="medibook-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-700 mb-0"><i className="bi bi-calendar-week me-2 text-primary"></i>Weekly Schedule</h6>
                <button className="btn btn-medibook btn-sm" onClick={saveSchedule} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-save me-1"></i>}
                  Save Schedule
                </button>
              </div>

              <div className="table-responsive">
                <table className="table medibook-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Active</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Slot (min)</th>
                      <th>Max Patients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} className={!form[day].enabled ? 'table-light' : ''}>
                        <td className="fw-600">{day.charAt(0) + day.slice(1).toLowerCase()}</td>
                        <td>
                          <div className="form-check form-switch mb-0">
                            <input className="form-check-input" type="checkbox" checked={form[day].enabled}
                              onChange={e => setDay(day, 'enabled', e.target.checked)} />
                          </div>
                        </td>
                        <td>
                          <input type="time" className="form-control form-control-sm" style={{ width: '120px' }}
                            value={form[day].startTime} disabled={!form[day].enabled}
                            onChange={e => setDay(day, 'startTime', e.target.value)} />
                        </td>
                        <td>
                          <input type="time" className="form-control form-control-sm" style={{ width: '120px' }}
                            value={form[day].endTime} disabled={!form[day].enabled}
                            onChange={e => setDay(day, 'endTime', e.target.value)} />
                        </td>
                        <td>
                          <select className="form-select form-select-sm" style={{ width: '90px' }}
                            value={form[day].slotDurationMinutes} disabled={!form[day].enabled}
                            onChange={e => setDay(day, 'slotDurationMinutes', parseInt(e.target.value))}>
                            {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="number" className="form-control form-control-sm" style={{ width: '80px' }}
                            value={form[day].maxPatients} disabled={!form[day].enabled} min={1} max={50}
                            onChange={e => setDay(day, 'maxPatients', parseInt(e.target.value))} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="medibook-card p-4">
              <h6 className="fw-700 mb-4"><i className="bi bi-calendar-x me-2 text-danger"></i>Mark Leave / Holiday</h6>
              {leaveMsg && <div className={`alert ${leaveMsg.includes('success') ? 'alert-success' : 'alert-danger'} medibook-alert mb-3`}>{leaveMsg}</div>}
              <form onSubmit={addLeave} className="medibook-form">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label>Leave Date</label>
                    <input type="date" className="form-control" value={leaveDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setLeaveDate(e.target.value)} required />
                  </div>
                  <div className="col-md-5">
                    <label>Reason (Optional)</label>
                    <input type="text" className="form-control" placeholder="Personal, Emergency, Conference"
                      value={leaveReason} onChange={e => setLeaveReason(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn btn-danger w-100" style={{ borderRadius: '10px' }}>
                      <i className="bi bi-calendar-minus me-2"></i>Mark Leave
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [noteModal, setNoteModal] = useState({ show: false, appointmentId: null })
  const [noteForm, setNoteForm] = useState({ diagnosis: '', consultationNotes: '', followUpDate: '' })

  useEffect(() => {
    api.get('/doctor/appointments').then(r => setAppointments(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/doctor/appointments/${id}/status`, { status })
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (e) { alert('Update failed') }
  }

  const saveNotes = async () => {
    try {
      await api.post('/medical-records', { appointmentId: noteModal.appointmentId, ...noteForm })
      alert('Notes saved!')
      setNoteModal({ show: false, appointmentId: null })
    } catch (e) { alert('Failed to save notes') }
  }

  const statusClass = {
    PENDING: 'status-pending', CONFIRMED: 'status-confirmed',
    COMPLETED: 'status-completed', CANCELLED: 'status-cancelled', NO_SHOW: 'status-no_show'
  }

  return (
    <>
      <div className="page-header">
        <div className="container"><h1>All Appointments</h1></div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><DoctorSidebar active="/doctor/appointments" /></div>
          <div className="col-lg-9">
            <div className="medibook-card p-4">
              <div className="d-flex gap-2 mb-4 flex-wrap">
                {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(s => (
                  <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ borderRadius: '20px' }} onClick={() => setFilter(s)}>
                    {s}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="medibook-spinner"><div className="spinner-border text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>No appointments found
                </div>
              ) : filtered.map(a => (
                <div key={a.id} className="appointment-card mb-3">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="bi bi-person text-primary fs-4"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between flex-wrap gap-2">
                        <div>
                          <div className="fw-700">{a.patient?.fullName}</div>
                          <div className="small text-muted">
                            <i className="bi bi-calendar3 me-1"></i>{a.appointmentDate} &nbsp;
                            <i className="bi bi-clock me-1"></i>{a.appointmentTime?.slice(0, 5)}
                          </div>
                          <div className="small text-muted mt-1">
                            <i className="bi bi-chat-text me-1"></i>{a.reasonForVisit}
                          </div>
                        </div>
                        <div className="text-end">
                          <span className={`status-badge ${statusClass[a.status]}`}>{a.status}</span>
                          <div className="small text-muted mt-1">#{a.bookingId}</div>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-3 flex-wrap">
                        {a.status === 'CONFIRMED' && (
                          <>
                            <button className="btn btn-sm btn-success" style={{ borderRadius: '8px' }}
                              onClick={() => updateStatus(a.id, 'COMPLETED')}>
                              <i className="bi bi-check me-1"></i>Mark Complete
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '8px' }}
                              onClick={() => updateStatus(a.id, 'NO_SHOW')}>
                              No Show
                            </button>
                          </>
                        )}
                        {a.status === 'COMPLETED' && (
                          <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: '8px' }}
                            onClick={() => { setNoteModal({ show: true, appointmentId: a.id }) }}
                            data-bs-toggle="modal" data-bs-target="#notesModal">
                            <i className="bi bi-clipboard2-pulse me-1"></i>Add Notes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="notesModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: '16px' }}>
            <div className="modal-header border-0">
              <h5 className="modal-title fw-700">
                <i className="bi bi-clipboard2-pulse me-2 text-primary"></i>Add Consultation Notes
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body medibook-form">
              <div className="row g-3">
                <div className="col-12">
                  <label>Diagnosis</label>
                  <input type="text" className="form-control" placeholder="Enter diagnosis"
                    value={noteForm.diagnosis} onChange={e => setNoteForm({ ...noteForm, diagnosis: e.target.value })} />
                </div>
                <div className="col-12">
                  <label>Consultation Notes</label>
                  <textarea className="form-control" rows="4" placeholder="Detailed notes, prescriptions, observations"
                    value={noteForm.consultationNotes} onChange={e => setNoteForm({ ...noteForm, consultationNotes: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label>Follow-up Date (Optional)</label>
                  <input type="date" className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={noteForm.followUpDate} onChange={e => setNoteForm({ ...noteForm, followUpDate: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-medibook" data-bs-dismiss="modal" onClick={saveNotes}>
                <i className="bi bi-save me-2"></i>Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function DoctorEarnings() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/doctor/appointments').then(r => setAppointments(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const completed = appointments.filter(a => a.status === 'COMPLETED')
  const totalEarnings = completed.reduce((sum, a) => sum + (a.doctor?.consultationFee || 0), 0)

  const today = new Date().toISOString().split('T')[0]
  const thisMonth = new Date().toISOString().slice(0, 7)
  const todayEarnings = completed.filter(a => a.appointmentDate === today).reduce((s, a) => s + (a.doctor?.consultationFee || 0), 0)
  const monthEarnings = completed.filter(a => a.appointmentDate?.startsWith(thisMonth)).reduce((s, a) => s + (a.doctor?.consultationFee || 0), 0)

  return (
    <>
      <div className="page-header">
        <div className="container"><h1>Earnings</h1></div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><DoctorSidebar active="/doctor/earnings" /></div>
          <div className="col-lg-9">
            <div className="row g-3 mb-4">
              {[
                { label: "Today's Earnings", value: `₹${todayEarnings}`, icon: 'bi-calendar-day', color: '#0d6efd', border: '#0d6efd' },
                { label: 'This Month', value: `₹${monthEarnings}`, icon: 'bi-calendar-month', color: '#0d9488', border: '#0d9488' },
                { label: 'Total Earnings', value: `₹${totalEarnings}`, icon: 'bi-cash-stack', color: '#8b5cf6', border: '#8b5cf6' },
                { label: 'Completed', value: completed.length, icon: 'bi-check-circle', color: '#f59e0b', border: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="stat-card" style={{ borderLeftColor: s.border }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="stat-number mb-1" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
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
              <h6 className="fw-700 mb-4">Completed Appointments (Revenue Source)</h6>
              {loading ? (
                <div className="medibook-spinner"><div className="spinner-border text-primary" /></div>
              ) : completed.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-cash fs-1 d-block mb-3"></i>No earnings yet
                </div>
              ) : (
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
                      {completed.map(a => (
                        <tr key={a.id}>
                          <td><code className="text-primary">#{a.bookingId}</code></td>
                          <td className="fw-600">{a.patient?.fullName}</td>
                          <td>{a.appointmentDate}</td>
                          <td>{a.appointmentTime?.slice(0, 5)}</td>
                          <td className="fw-700 text-success">₹{a.doctor?.consultationFee}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light">
                        <td colSpan="4" className="fw-700 text-end">Total</td>
                        <td className="fw-700 text-success fs-5">₹{totalEarnings}</td>
                      </tr>
                    </tfoot>
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

export default DoctorDashboard