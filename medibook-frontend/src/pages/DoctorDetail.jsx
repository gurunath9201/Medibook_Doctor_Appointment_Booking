import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function DoctorDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/doctors/${id}`),
      api.get(`/reviews/doctor/${id}`)
    ]).then(([dRes, rRes]) => {
      setDoctor(dRes.data)
      setReviews(rRes.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="medibook-spinner"><div className="spinner-border text-primary" style={{width:'3rem',height:'3rem'}} /></div>
  if (!doctor) return <div className="container py-5 text-center"><h4>Doctor not found</h4></div>

  const initials = doctor.user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <div className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{ '--bs-breadcrumb-divider-color': 'rgba(255,255,255,0.5)', '--bs-breadcrumb-item-active-color': '#fff' }}>
              <li className="breadcrumb-item"><Link to="/doctors" className="text-white-50">Doctors</Link></li>
              <li className="breadcrumb-item active">Dr. {doctor.user?.fullName}</li>
            </ol>
          </nav>
          <h1>Doctor Profile</h1>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          {/* Left - Profile */}
          <div className="col-lg-8">
            <div className="medibook-card p-4 mb-4">
              <div className="d-flex gap-4 flex-wrap">
                <div className="doctor-avatar-placeholder flex-shrink-0" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>{initials}</div>
                <div className="flex-grow-1">
                  <h3 className="fw-700 mb-1" style={{ fontWeight: '700' }}>Dr. {doctor.user?.fullName}</h3>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {(doctor.specializations || []).map(s => (
                      <span key={s.id} className="spec-badge">{s.name}</span>
                    ))}
                  </div>
                  <div className="d-flex gap-4 text-muted small flex-wrap">
                    <span><i className="bi bi-award me-1 text-warning"></i>{doctor.experienceYears} years experience</span>
                    <span><i className="bi bi-star-fill me-1 text-warning"></i>{Number(doctor.averageRating).toFixed(1)} ({doctor.totalReviews} reviews)</span>
                    <span><i className="bi bi-translate me-1 text-info"></i>{doctor.languagesSpoken || 'English, Hindi'}</span>
                  </div>
                  <div className="mt-2">
                    <span className="badge bg-success-subtle text-success"><i className="bi bi-check-circle me-1"></i>Verified Doctor</span>
                  </div>
                </div>
              </div>
            </div>

            {doctor.bio && (
              <div className="medibook-card p-4 mb-4">
                <h5 className="fw-700 mb-3"><i className="bi bi-person me-2 text-primary"></i>About Doctor</h5>
                <p className="text-muted mb-0">{doctor.bio}</p>
              </div>
            )}

            <div className="medibook-card p-4 mb-4">
              <h5 className="fw-700 mb-3"><i className="bi bi-info-circle me-2 text-primary"></i>Details</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                    <i className="bi bi-mortarboard-fill text-primary fs-4"></i>
                    <div>
                      <div className="small text-muted">Qualification</div>
                      <div className="fw-600">{doctor.qualification}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                    <i className="bi bi-hospital-fill text-success fs-4"></i>
                    <div>
                      <div className="small text-muted">Clinic</div>
                      <div className="fw-600">{doctor.clinic?.name || 'Private Clinic'}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                    <i className="bi bi-geo-alt-fill text-danger fs-4"></i>
                    <div>
                      <div className="small text-muted">Location</div>
                      <div className="fw-600">{doctor.clinic?.city || doctor.user?.city || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                    <i className="bi bi-cash-stack text-warning fs-4"></i>
                    <div>
                      <div className="small text-muted">Consultation Fee</div>
                      <div className="fw-700 text-success fs-5">₹{doctor.consultationFee}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="medibook-card p-4">
              <h5 className="fw-700 mb-3"><i className="bi bi-star me-2 text-warning"></i>Patient Reviews ({reviews.length})</h5>
              {reviews.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="bi bi-chat-square-text fs-2 d-block mb-2"></i>No reviews yet
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between">
                    <div className="fw-600">{r.patient?.fullName}</div>
                    <div className="text-warning">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  {r.reviewText && <p className="text-muted small mt-1 mb-1">{r.reviewText}</p>}
                  {r.doctorReply && (
                    <div className="p-2 rounded" style={{ background: '#f0f9ff', borderLeft: '3px solid #0d6efd' }}>
                      <small className="text-primary fw-600">Doctor's Reply: </small>
                      <small className="text-muted">{r.doctorReply}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="medibook-card p-4 sticky-top" style={{ top: '80px' }}>
              <h5 className="fw-700 mb-3">Book Appointment</h5>
              <div className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-4" style={{ background: '#f0fdf4' }}>
                <span className="text-muted small">Consultation Fee</span>
                <span className="fw-700 text-success fs-4">₹{doctor.consultationFee}</span>
              </div>
              <div className="d-flex flex-column gap-2 mb-4">
                {['Instant Appointment Confirmation', 'Online Payment via Razorpay', 'Email Reminders', 'Download Prescription'].map(f => (
                  <div key={f} className="d-flex align-items-center gap-2 small text-muted">
                    <i className="bi bi-check-circle-fill text-success"></i>{f}
                  </div>
                ))}
              </div>
              {user ? (
                <Link to={`/book/${doctor.id}`} className="btn btn-medibook w-100 py-2">
                  <i className="bi bi-calendar-plus me-2"></i>Book Appointment
                </Link>
              ) : (
                <Link to="/login" className="btn btn-medibook w-100 py-2">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Login to Book
                </Link>
              )}
              <div className="text-center mt-3 small text-muted">
                <i className="bi bi-shield-check me-1 text-success"></i>Secure & Verified Platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}