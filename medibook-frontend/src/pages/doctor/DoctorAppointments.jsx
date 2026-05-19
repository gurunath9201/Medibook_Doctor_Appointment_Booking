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

const STATUS_CLASS = {
  PENDING:    'status-pending',
  CONFIRMED:  'status-confirmed',
  COMPLETED:  'status-completed',
  CANCELLED:  'status-cancelled',
  NO_SHOW:    'status-no_show',
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('ALL')
  const [search, setSearch]             = useState('')
  const [noteModal, setNoteModal]       = useState({ open: false, appointmentId: null })
  const [noteForm, setNoteForm]         = useState({ diagnosis: '', consultationNotes: '', followUpDate: '' })
  const [noteSaving, setNoteSaving]     = useState(false)
  const [noteMsg, setNoteMsg]           = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/doctor/appointments')
      setAppointments(res.data || [])
    } catch (e) {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/doctor/appointments/${id}/status`, { status })
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status } : a)
      )
    } catch (e) {
      alert('Failed to update status')
    }
  }

  const openNoteModal = (appointmentId) => {
    setNoteForm({ diagnosis: '', consultationNotes: '', followUpDate: '' })
    setNoteMsg('')
    setNoteModal({ open: true, appointmentId })
  }

  const saveNotes = async () => {
    setNoteSaving(true)
    setNoteMsg('')
    try {
      await api.post('/medical-records', {
        appointmentId: noteModal.appointmentId,
        diagnosis: noteForm.diagnosis,
        consultationNotes: noteForm.consultationNotes,
        followUpDate: noteForm.followUpDate || null,
      })
      setNoteMsg('success')
      setTimeout(() => {
        const modal = window.bootstrap?.Modal.getInstance(document.getElementById('notesModal'))
        modal?.hide()
        setNoteModal({ open: false, appointmentId: null })
      }, 1200)
    } catch (e) {
      setNoteMsg('error')
    } finally {
      setNoteSaving(false)
    }
  }

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'ALL' || a.status === filter
    const matchSearch = search === '' ||
      a.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.bookingId?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-calendar-check me-3"></i>All Appointments</h1>
          <p className="mb-0 opacity-75">Manage your patient appointments</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3">
            <DoctorSidebar active="/doctor/appointments" />
          </div>

          <div className="col-lg-9">
            <div className="medibook-card p-4">

              <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
                <div className="input-group" style={{ maxWidth: '260px' }}>
                  <span className="input-group-text bg-light">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search patient, booking ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ borderRadius: '0 10px 10px 0' }}
                  />
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(f => (
                    <button
                      key={f}
                      className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ borderRadius: '20px' }}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="small text-muted mb-3">
                Showing {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
              </div>

              {loading ? (
                <div className="medibook-spinner py-4">
                  <div className="spinner-border text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50"></i>
                  <h6>No appointments found</h6>
                </div>
              ) : filtered.map(a => (
                <div key={a.id} className="appointment-card mb-3">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div style={{
                      width: '50px', height: '50px', borderRadius: '14px',
                      background: 'linear-gradient(135deg,#eff6ff,#e0f2fe)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <i className="bi bi-person text-primary" style={{ fontSize: '1.4rem' }}></i>
                    </div>

                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between flex-wrap gap-2 mb-1">
                        <h6 className="fw-700 mb-0" style={{ fontWeight: '700' }}>
                          {a.patient?.fullName}
                        </h6>
                        <span className={`status-badge ${STATUS_CLASS[a.status] || ''}`}>
                          {a.status}
                        </span>
                      </div>

                      <div className="d-flex flex-wrap gap-3 small text-muted mb-2">
                        <span><i className="bi bi-calendar3 me-1"></i>{a.appointmentDate}</span>
                        <span><i className="bi bi-clock me-1"></i>{a.appointmentTime?.slice(0, 5)}</span>
                        <span><i className="bi bi-telephone me-1"></i>{a.patient?.phone || 'N/A'}</span>
                        <span className="text-primary"><i className="bi bi-hash me-1"></i>{a.bookingId}</span>
                      </div>

                      {a.reasonForVisit && (
                        <div className="small text-muted mb-2">
                          <i className="bi bi-chat-text me-1"></i>
                          <em>{a.reasonForVisit}</em>
                        </div>
                      )}

                      <div className="d-flex gap-2 flex-wrap mt-2">
                        {a.status === 'CONFIRMED' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              style={{ borderRadius: '8px' }}
                              onClick={() => updateStatus(a.id, 'COMPLETED')}
                            >
                              <i className="bi bi-check-circle me-1"></i>Mark Complete
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              style={{ borderRadius: '8px' }}
                              onClick={() => updateStatus(a.id, 'NO_SHOW')}
                            >
                              <i className="bi bi-person-x me-1"></i>No Show
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              style={{ borderRadius: '8px' }}
                              onClick={() => updateStatus(a.id, 'CANCELLED')}
                            >
                              <i className="bi bi-x-circle me-1"></i>Cancel
                            </button>
                          </>
                        )}
                        {a.status === 'PENDING' && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ borderRadius: '8px' }}
                            onClick={() => updateStatus(a.id, 'CONFIRMED')}
                          >
                            <i className="bi bi-check me-1"></i>Confirm
                          </button>
                        )}
                        {a.status === 'COMPLETED' && (
                          <button
                            className="btn btn-sm btn-outline-info"
                            style={{ borderRadius: '8px' }}
                            data-bs-toggle="modal"
                            data-bs-target="#notesModal"
                            onClick={() => openNoteModal(a.id)}
                          >
                            <i className="bi bi-clipboard2-pulse me-1"></i>Add Notes
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-end flex-shrink-0">
                      <div className="fw-700 text-success">₹{a.doctor?.consultationFee}</div>
                      <div className="small text-muted">Fee</div>
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
          <div className="modal-content" style={{ borderRadius: '18px', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="modal-header border-0">
              <h5 className="modal-title fw-700" style={{ fontWeight: '700' }}>
                <i className="bi bi-clipboard2-pulse me-2 text-primary"></i>Add Consultation Notes
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body medibook-form">
              {noteMsg === 'success' ? (
                <div className="text-center py-3">
                  <i className="bi bi-check-circle-fill text-success fs-1 d-block mb-3"></i>
                  <h6 className="fw-700">Notes Saved Successfully!</h6>
                </div>
              ) : (
                <>
                  {noteMsg === 'error' && (
                    <div className="alert alert-danger medibook-alert mb-3">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      Failed to save notes. Please try again.
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-12">
                      <label>Diagnosis</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter diagnosis"
                        value={noteForm.diagnosis}
                        onChange={e => setNoteForm(p => ({ ...p, diagnosis: e.target.value }))}
                      />
                    </div>
                    <div className="col-12">
                      <label>Consultation Notes</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Detailed notes, treatment plan, observations"
                        value={noteForm.consultationNotes}
                        onChange={e => setNoteForm(p => ({ ...p, consultationNotes: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Follow-up Date <span className="text-muted">(Optional)</span></label>
                      <input
                        type="date"
                        className="form-control"
                        min={new Date().toISOString().split('T')[0]}
                        value={noteForm.followUpDate}
                        onChange={e => setNoteForm(p => ({ ...p, followUpDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            {noteMsg !== 'success' && (
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary" data-bs-dismiss="modal" style={{ borderRadius: '10px' }}>
                  Cancel
                </button>
                <button
                  className="btn btn-medibook"
                  onClick={saveNotes}
                  disabled={noteSaving}
                  style={{ borderRadius: '10px' }}
                >
                  {noteSaving
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                    : <><i className="bi bi-save me-2"></i>Save Notes</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}