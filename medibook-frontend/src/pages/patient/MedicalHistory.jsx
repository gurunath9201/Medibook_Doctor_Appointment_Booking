import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

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

export default function MedicalHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/medical-records/my')
      .then(r => {
        console.log('Medical records:', r.data);  // debug
        setRecords(r.data || [])
      })
      .catch(err => console.error('Failed to load medical records', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-file-medical me-3"></i>Medical History</h1>
          <p className="mb-0 opacity-75">View all your past consultation records</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><PatientSidebar active="/patient/medical-history" /></div>
          <div className="col-lg-9">
            {loading ? (
              <div className="medibook-spinner"><div className="spinner-border text-primary" /></div>
            ) : records.length === 0 ? (
              <div className="medibook-card p-5 text-center text-muted">
                <i className="bi bi-file-medical fs-1 d-block mb-3 opacity-50"></i>
                <h5>No medical records yet</h5>
                <p className="small mb-4">Your consultation records from doctors will appear here after completed appointments.</p>
                <Link to="/doctors" className="btn btn-primary" style={{ borderRadius: '10px' }}>
                  <i className="bi bi-search-heart me-2"></i>Find a Doctor
                </Link>
              </div>
            ) : (
              <div>
                {records.map((r, idx) => (
                  <div key={r.id} className="medibook-card p-4 mb-3">
                    <div className="d-flex align-items-start gap-3">
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="bi bi-file-medical-fill text-success" style={{ fontSize: '1.3rem' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                          <div>
                            <h6 className="fw-700 mb-1" style={{ fontWeight: '700' }}>
                              Dr. {r.doctor?.user?.fullName}
                            </h6>
                            <div className="small text-muted">
                              {r.doctor?.specializations?.[0]?.name} &nbsp;•&nbsp;
                              <i className="bi bi-calendar3 me-1"></i>
                              {r.appointment?.appointmentDate || r.createdAt?.slice(0, 10)}
                            </div>
                          </div>
                          <div>
                            <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem' }}>
                              Visit #{records.length - idx}
                            </span>
                          </div>
                        </div>

                        {r.diagnosis && (
                          <div className="p-3 rounded-3 mb-2" style={{ background: '#fefce8', borderLeft: '3px solid #f59e0b' }}>
                            <div className="small fw-600 text-warning mb-1">
                              <i className="bi bi-activity me-1"></i>Diagnosis
                            </div>
                            <div className="small">{r.diagnosis}</div>
                          </div>
                        )}

                        {r.consultationNotes && (
                          <div className="p-3 rounded-3 mb-2" style={{ background: '#f0f9ff', borderLeft: '3px solid #0d6efd' }}>
                            <div className="small fw-600 text-primary mb-1">
                              <i className="bi bi-clipboard2-pulse me-1"></i>Consultation Notes
                            </div>
                            <div className="small text-muted">{r.consultationNotes}</div>
                          </div>
                        )}

                        {r.followUpDate && (
                          <div className="d-flex align-items-center gap-2 small mt-2">
                            <i className="bi bi-calendar-event text-primary"></i>
                            <span className="fw-600">Follow-up Date:</span>
                            <span className="text-primary">{r.followUpDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}