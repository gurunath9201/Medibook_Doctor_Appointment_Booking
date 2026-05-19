import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Home() {
  const [specializations, setSpecializations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpec, setSelectedSpec] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/specializations').then(r => setSpecializations(r.data)).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set('name', searchTerm)
    if (selectedSpec) params.set('spec', selectedSpec)
    navigate('/doctors?' + params.toString())
  }

  const specIcons = ['bi-heart-pulse', 'bi-droplet', 'bi-person-standing', 'bi-person-heart', 'bi-activity', 'bi-gender-female', 'bi-ear', 'bi-emoji-smile', 'bi-activity', 'bi-capsule']
  const specColors = ['#ef4444','#f97316','#8b5cf6','#06b6d4','#10b981','#ec4899','#6366f1','#84cc16','#f59e0b','#14b8a6']


  const steps = [
    { icon: 'bi-search', title: 'Search Doctor', desc: 'Find the right specialist by name, specialization or location', color: '#0d6efd' },
    { icon: 'bi-calendar3', title: 'Book Slot', desc: 'Pick a convenient date and time from available slots', color: '#0d9488' },
    { icon: 'bi-credit-card', title: 'Pay Online', desc: 'Secure payment via Razorpay — UPI, Card, NetBanking', color: '#8b5cf6' },
    { icon: 'bi-check-circle', title: 'Visit Doctor', desc: 'Get confirmation and visit the doctor at scheduled time', color: '#f59e0b' },
  ]

  return (
    <>
      <section className="hero-section">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <h1 className="hero-title">
                Book Doctor<br />Appointments<br />
                <span style={{ color: '#bfdbfe' }}>Instantly Online</span>
              </h1>
              <p className="hero-subtitle">
                Find the best doctors, book appointments in minutes, and pay securely with Razorpay. Your health is our priority.
              </p>

              <form onSubmit={handleSearch} className="search-bar">
                <div className="row g-3">
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search doctor name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ borderRadius: '0 10px 10px 0' }}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={selectedSpec}
                      onChange={e => setSelectedSpec(e.target.value)}
                      style={{ borderRadius: '10px' }}
                    >
                      <option value="">All Specializations</option>
                      {specializations.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn btn-medibook w-100">
                      <i className="bi bi-search me-2"></i>Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <div style={{ fontSize: '200px', lineHeight: 1, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }}>
                🏥
              </div>
              <div className="d-flex justify-content-center gap-3 mt-3">
                {['Online Consultation', 'Instant Booking', 'Secure Payment'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '500', backdropFilter: 'blur(10px)' }}>
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="py-5" style={{ background: '#bbefc7' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">Specializations</span>
            <h2 className="section-title">Find by Specialization</h2>
            <p className="section-subtitle">Choose from 10+ medical specializations and find your expert</p>
          </div>
          <div className="row g-3">
            {specializations.map((spec, i) => (
              <div key={spec.id} className="col-6 col-md-4 col-lg-2-4">
                <Link
                  to={`/doctors?spec=${spec.id}`}
                  className="text-decoration-none"
                >
                  <div className="medibook-card p-3 text-center h-100" style={{ cursor: 'pointer' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: (specColors[i % specColors.length]) + '15', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`${specIcons[i % specIcons.length]} fs-4`} style={{ color: specColors[i % specColors.length] }}></i>
                    </div>
                    <div className="fw-600 text-dark small" style={{ fontWeight: '600', fontSize: '0.85rem' }}>{spec.name}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/doctors" className="btn btn-outline-primary px-4" style={{ borderRadius: '10px' }}>
              View All Doctors <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill mb-3">How It Works</span>
            <h2 className="section-title">Book in 4 Simple Steps</h2>
            <p className="section-subtitle">From search to appointment in under 2 minutes</p>
          </div>
          <div className="row g-4">
            {steps.map((step, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="text-center p-4">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: step.color + '15', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`${step.icon} fs-2`} style={{ color: step.color }}></i>
                    </div>
                    <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: step.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>
                      {i + 1}
                    </div>
                  </div>
                  <h5 className="fw-700 mb-2" style={{ fontWeight: '700' }}>{step.title}</h5>
                  <p className="text-muted small mb-0">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}