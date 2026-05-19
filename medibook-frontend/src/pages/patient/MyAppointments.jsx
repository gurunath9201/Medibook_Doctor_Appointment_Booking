import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { StarRatingInput } from '../../components/StarRating'

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
  PENDING: 'status-pending', CONFIRMED: 'status-confirmed',
  COMPLETED: 'status-completed', CANCELLED: 'status-cancelled', NO_SHOW: 'status-no_show',
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [reviewModal, setReviewModal] = useState({ appointmentId: null })
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' })
  const [reviewMsg, setReviewMsg] = useState('')
  const location = useLocation()

  useEffect(() => {
    fetchAppointments()
    if (location.search.includes('payment=success')) {
      setTimeout(() => alert('Payment successful! Your appointment is confirmed.'), 400)
    }
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/appointments/my')
      setAppointments(res.data || [])
    } catch (e) { setAppointments([]) }
    finally { setLoading(false) }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await api.put(`/appointments/${id}/cancel`)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
    } catch (e) { alert('Cancellation failed') }
  }

  const submitReview = async () => {
    try {
      await api.post('/reviews', { appointmentId: reviewModal.appointmentId, ...reviewForm })
      setReviewMsg('success')
    } catch (e) { setReviewMsg('error') }
  }

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-calendar-check me-3"></i>My Appointments</h1>
          <p className="mb-0 opacity-75">Track all your bookings</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><PatientSidebar active="/patient/appointments" /></div>
          <div className="col-lg-9">
            <div className="medibook-card p-4">
              <div className="d-flex gap-2 mb-4 flex-wrap">
                {['ALL','PENDING','CONFIRMED','COMPLETED','CANCELLED'].map(f => (
                  <button key={f}
                    className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ borderRadius: '20px' }} onClick={() => setFilter(f)}>
                    {f}
                    <span className="ms-1 badge" style={{ background: filter===f?'rgba(255,255,255,0.3)':'#e2e8f0', color: filter===f?'#fff':'#64748b', fontSize:'0.65rem' }}>
                      {f==='ALL'?appointments.length:appointments.filter(a=>a.status===f).length}
                    </span>
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="medibook-spinner py-4"><div className="spinner-border text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50"></i>
                  <h6>No appointments found</h6>
                  <Link to="/doctors" className="btn btn-primary btn-sm mt-2" style={{ borderRadius:'8px' }}>
                    <i className="bi bi-plus-circle me-2"></i>Book New Appointment
                  </Link>
                </div>
              ) : filtered.map(a => (
                <div key={a.id} className="appointment-card mb-3">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div style={{ width:'52px',height:'52px',borderRadius:'14px',background:'linear-gradient(135deg,#eff6ff,#e0f2fe)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      <i className="bi bi-person-circle text-primary" style={{ fontSize:'1.6rem' }}></i>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between flex-wrap gap-2 mb-1">
                        <h6 className="fw-700 mb-0" style={{ fontWeight:'700' }}>Dr. {a.doctor?.user?.fullName}</h6>
                        <span className={`status-badge ${STATUS_CLASS[a.status]||''}`}>{a.status}</span>
                      </div>
                      <div className="small text-muted mb-1">{a.doctor?.specializations?.[0]?.name}</div>
                      <div className="d-flex flex-wrap gap-3 small text-muted mb-2">
                        <span><i className="bi bi-calendar3 me-1"></i>{a.appointmentDate}</span>
                        <span><i className="bi bi-clock me-1"></i>{a.appointmentTime?.slice(0,5)}</span>
                        <span className="text-primary"><i className="bi bi-hash me-1"></i>{a.bookingId}</span>
                      </div>
                      {a.reasonForVisit && (
                        <div className="small text-muted mb-2">
                          <i className="bi bi-chat-text me-1"></i><em>{a.reasonForVisit}</em>
                        </div>
                      )}
                      <div className="d-flex gap-2 flex-wrap mt-2">
                        {(a.status==='PENDING'||a.status==='CONFIRMED') && (
                          <button className="btn btn-sm btn-outline-danger" style={{ borderRadius:'8px' }} onClick={() => handleCancel(a.id)}>
                            <i className="bi bi-x-circle me-1"></i>Cancel
                          </button>
                        )}
                        {a.status==='COMPLETED' && (
                          <button className="btn btn-sm btn-outline-warning" style={{ borderRadius:'8px' }}
                            data-bs-toggle="modal" data-bs-target="#reviewModal"
                            onClick={() => { setReviewModal({appointmentId:a.id}); setReviewMsg(''); setReviewForm({rating:5,reviewText:''}) }}>
                            <i className="bi bi-star me-1"></i>Rate Doctor
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <div className="fw-700 text-success" style={{ fontSize:'1.1rem' }}>₹{a.doctor?.consultationFee}</div>
                      <div className="small text-muted">Fee</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="reviewModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius:'18px', border:'none', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-700"><i className="bi bi-star-fill text-warning me-2"></i>Rate Your Doctor</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body medibook-form">
              {reviewMsg==='success' ? (
                <div className="text-center py-3">
                  <i className="bi bi-check-circle-fill text-success fs-1 d-block mb-3"></i>
                  <h6 className="fw-700">Review Submitted!</h6>
                </div>
              ) : (
                <>
                  {reviewMsg==='error' && <div className="alert alert-danger medibook-alert mb-3">Failed to submit review.</div>}
                  <div className="mb-3">
                    <label className="form-label">Your Rating *</label>
                    <StarRatingInput value={reviewForm.rating} onChange={r => setReviewForm(p=>({...p,rating:r}))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Review <span className="text-muted">(Optional)</span></label>
                    <textarea className="form-control" rows="3" placeholder="Share your experience..."
                      value={reviewForm.reviewText} onChange={e => setReviewForm(p=>({...p,reviewText:e.target.value}))} />
                  </div>
                </>
              )}
            </div>
            {reviewMsg!=='success' && (
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary" data-bs-dismiss="modal" style={{ borderRadius:'10px' }}>Cancel</button>
                <button className="btn btn-medibook" onClick={submitReview} style={{ borderRadius:'10px' }}>
                  <i className="bi bi-send me-2"></i>Submit Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}