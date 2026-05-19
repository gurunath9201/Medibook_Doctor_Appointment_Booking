import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'

function DoctorCard({ doctor }) {
  const initials = doctor.user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const specs = doctor.specializations || []
  return (
    <div className="col-md-6 col-lg-4">
      <div className="doctor-card h-100">
        <div className="p-4">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div className="doctor-avatar-placeholder flex-shrink-0">{initials}</div>
            <div className="flex-grow-1 min-w-0">
              <h6 className="fw-700 mb-1 text-truncate" style={{ fontWeight: '700' }}>
                Dr. {doctor.user?.fullName}
              </h6>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {specs.slice(0, 2).map(s => (
                  <span key={s.id} className="spec-badge">{s.name}</span>
                ))}
              </div>
              <div className="d-flex align-items-center gap-3 text-muted small">
                <span><i className="bi bi-award me-1 text-warning"></i>{doctor.experienceYears} yrs exp</span>
                <span className="rating-stars">
                  {'★'.repeat(Math.round(doctor.averageRating || 0))}{'☆'.repeat(5 - Math.round(doctor.averageRating || 0))}
                  <span className="text-muted ms-1">({doctor.totalReviews})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-top pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="text-muted small mb-1"><i className="bi bi-hospital me-1"></i>{doctor.clinic?.name || 'Private Clinic'}</div>
                <div className="text-muted small"><i className="bi bi-geo-alt me-1"></i>{doctor.user?.city || 'N/A'}</div>
              </div>
              <div className="text-end">
                <div className="text-muted small">Consultation</div>
                <div className="fw-700 text-success" style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹{doctor.consultationFee}</div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Link to={`/doctors/${doctor.id}`} className="btn btn-outline-primary btn-sm flex-grow-1" style={{ borderRadius: '8px' }}>
                View Profile
              </Link>
              <Link to={`/book/${doctor.id}`} className="btn btn-medibook btn-sm flex-grow-1" style={{ borderRadius: '8px', background: 'linear-gradient(135deg,#0d6efd,#0d9488)', border: 'none', color: '#fff' }}>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    spec: searchParams.get('spec') || '',
    city: '',
    sortBy: 'rating'
  })

  useEffect(() => {
    api.get('/specializations').then(r => setSpecializations(r.data)).catch(() => {})
    fetchDoctors()
  }, [])

  const fetchDoctors = async (f = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (f.name) params.set('name', f.name)
      if (f.spec) params.set('specializationId', f.spec)
      if (f.city) params.set('city', f.city)
      const res = await api.get('/doctors/search?' + params.toString())
      let data = res.data || []
      if (f.sortBy === 'rating') data.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      else if (f.sortBy === 'fee_asc') data.sort((a, b) => a.consultationFee - b.consultationFee)
      else if (f.sortBy === 'fee_desc') data.sort((a, b) => b.consultationFee - a.consultationFee)
      else if (f.sortBy === 'exp') data.sort((a, b) => b.experienceYears - a.experienceYears)
      setDoctors(data)
    } catch (e) { setDoctors([]) }
    finally { setLoading(false) }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDoctors(filters)
  }

  const set = (field) => (e) => setFilters({ ...filters, [field]: e.target.value })

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-search-heart me-3"></i>Find Doctors</h1>
          <p className="mb-0 opacity-75">Search from 200+ verified doctors across specializations</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="search-bar mb-4">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-500 small text-muted">Doctor Name</label>
                <input type="text" className="form-control" placeholder="Search doctor..."
                  value={filters.name} onChange={set('name')} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-500 small text-muted">Specialization</label>
                <select className="form-select" value={filters.spec} onChange={set('spec')}>
                  <option value="">All Specializations</option>
                  {specializations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-500 small text-muted">City</label>
                <input type="text" className="form-control" placeholder="City..."
                  value={filters.city} onChange={set('city')} />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-500 small text-muted">Sort By</label>
                <select className="form-select" value={filters.sortBy} onChange={set('sortBy')}>
                  <option value="rating">Top Rated</option>
                  <option value="exp">Experience</option>
                  <option value="fee_asc">Fee: Low to High</option>
                  <option value="fee_desc">Fee: High to Low</option>
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-medibook w-100">
                  <i className="bi bi-search me-2"></i>Search
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted mb-0 small">{loading ? 'Searching...' : `${doctors.length} doctor(s) found`}</p>
        </div>

        {loading ? (
          <div className="medibook-spinner">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-search text-muted" style={{ fontSize: '4rem' }}></i>
            <h5 className="mt-3 text-muted">No doctors found</h5>
            <p className="text-muted small">Try changing your search filters</p>
          </div>
        ) : (
          <div className="row g-4">
            {doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        )}
      </div>
    </>
  )
}