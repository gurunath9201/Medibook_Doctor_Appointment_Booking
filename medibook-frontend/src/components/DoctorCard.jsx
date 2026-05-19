import React from 'react'
import { Link } from 'react-router-dom'

export default function DoctorCard({ doctor }) {
  const initials = doctor?.user?.fullName
    ? doctor.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DR'

  const specs = doctor?.specializations || []
  const rating = Number(doctor?.averageRating || 0)
  const filledStars = Math.round(rating)

  return (
    <div className="doctor-card h-100">
      <div className="p-4">
        <div className="d-flex align-items-start gap-3 mb-3">
          <div
            className="doctor-avatar-placeholder flex-shrink-0"
            style={{ width: '70px', height: '70px', fontSize: '1.5rem' }}
          >
            {initials}
          </div>
          <div className="flex-grow-1 min-w-0">
            <h6 className="fw-700 mb-1 text-truncate" style={{ fontWeight: '700' }}>
              Dr. {doctor?.user?.fullName}
            </h6>
            <div className="d-flex flex-wrap gap-1 mb-1">
              {specs.slice(0, 2).map(s => (
                <span key={s.id} className="spec-badge">{s.name}</span>
              ))}
            </div>
            <div className="d-flex align-items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <i
                  key={i}
                  className={i <= filledStars ? 'bi bi-star-fill' : 'bi bi-star'}
                  style={{ color: '#f59e0b', fontSize: '0.75rem' }}
                />
              ))}
              <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>
                ({doctor?.totalReviews || 0})
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex gap-3 mb-3 text-muted" style={{ fontSize: '0.82rem' }}>
          <span>
            <i className="bi bi-award me-1 text-warning"></i>
            {doctor?.experienceYears || 0} yrs exp
          </span>
          <span>
            <i className="bi bi-geo-alt me-1 text-danger"></i>
            {doctor?.user?.city || 'N/A'}
          </span>
        </div>

        {doctor?.clinic?.name && (
          <div className="small text-muted mb-3">
            <i className="bi bi-hospital me-1 text-success"></i>
            {doctor.clinic.name}
          </div>
        )}

        <div className="border-top pt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Consultation Fee</div>
              <div className="fw-700 text-success" style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                ₹{doctor?.consultationFee}
              </div>
            </div>
            <div>
              {doctor?.isAvailable ? (
                <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>Available
                </span>
              ) : (
                <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.72rem' }}>
                  Unavailable
                </span>
              )}
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link
              to={`/doctors/${doctor?.id}`}
              className="btn btn-outline-primary btn-sm flex-grow-1"
              style={{ borderRadius: '8px', fontSize: '0.82rem' }}
            >
              View Profile
            </Link>
            <Link
              to={`/book/${doctor?.id}`}
              className="btn btn-sm flex-grow-1"
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg,#0d6efd,#0d9488)',
                border: 'none',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}