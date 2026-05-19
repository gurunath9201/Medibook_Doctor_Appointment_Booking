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

const RELATION_ICONS = { SELF:'bi-person',SPOUSE:'bi-heart',CHILD:'bi-star',PARENT:'bi-house',SIBLING:'bi-people',OTHER:'bi-person-plus' }
const RELATION_COLORS = { SELF:'#0d6efd',SPOUSE:'#ec4899',CHILD:'#f59e0b',PARENT:'#0d9488',SIBLING:'#8b5cf6',OTHER:'#6b7280' }

export default function FamilyMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ fullName:'', relation:'SPOUSE', gender:'MALE', bloodGroup:'' })

  useEffect(() => {
    api.get('/family-members')
      .then(r => setMembers(r.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await api.post('/family-members', form)
      setMembers(prev => [...prev, res.data])
      setShowForm(false)
      setForm({ fullName:'', relation:'SPOUSE', gender:'MALE', bloodGroup:'' })
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this family member?')) return
    try {
      await api.delete(`/family-members/${id}`)
      setMembers(prev => prev.filter(m => m.id !== id))
    } catch (e) {
      alert('Failed to remove member')
    }
  }

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-people me-3"></i>Family Members</h1>
          <p className="mb-0 opacity-75">Manage family members for easy appointment booking</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><PatientSidebar active="/patient/family" /></div>
          <div className="col-lg-9">
            <div className="medibook-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-700 mb-0" style={{ fontWeight:'700' }}>
                  <i className="bi bi-people me-2 text-primary"></i>
                  Family Members ({members.length})
                </h6>
                <button
                  className="btn btn-medibook btn-sm"
                  style={{ borderRadius:'10px' }}
                  onClick={() => { setShowForm(p => !p); setError('') }}
                >
                  <i className={`bi ${showForm ? 'bi-x-circle' : 'bi-plus-circle'} me-1`}></i>
                  {showForm ? 'Close' : 'Add Member'}
                </button>
              </div>

              {showForm && (
                <div className="p-4 rounded-3 mb-4" style={{ background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                  <h6 className="fw-600 mb-3">Add New Family Member</h6>
                  {error && (
                    <div className="alert alert-danger medibook-alert mb-3">
                      <i className="bi bi-exclamation-circle me-2"></i>{error}
                    </div>
                  )}
                  <form onSubmit={handleAdd} className="medibook-form">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label>Full Name*</label>
                        <input type="text" className="form-control" placeholder="Enter Full Name"
                          value={form.fullName} onChange={set('fullName')} required />
                      </div>
                      <div className="col-md-6">
                        <label>Relation*</label>
                        <select className="form-select" value={form.relation} onChange={set('relation')}>
                          {['SPOUSE','CHILD','PARENT','SIBLING','OTHER'].map(r => (
                            <option key={r} value={r}>{r.charAt(0)+r.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label>Gender</label>
                        <select className="form-select" value={form.gender} onChange={set('gender')}>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label>Blood Group</label>
                        <select className="form-select" value={form.bloodGroup} onChange={set('bloodGroup')}>
                          <option value="">Select Blood Group</option>
                          {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <button type="submit" className="btn btn-medibook" style={{ borderRadius:'10px' }} disabled={saving}>
                          {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-circle me-2"></i>}
                          {saving ? 'Saving...' : 'Save Member'}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" style={{ borderRadius:'10px' }}
                          onClick={() => setShowForm(false)}>Cancel</button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="medibook-spinner py-3"><div className="spinner-border text-primary" /></div>
              ) : members.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-people fs-1 d-block mb-3 opacity-50"></i>
                  <h6>No family members added</h6>
                  <p className="small">Add family members to book appointments on their behalf.</p>
                  <button className="btn btn-primary btn-sm" style={{ borderRadius:'8px' }} onClick={() => setShowForm(true)}>
                    <i className="bi bi-plus-circle me-2"></i>Add First Member
                  </button>
                </div>
              ) : (
                <div className="row g-3">
                  {members.map(m => {
                    const color = RELATION_COLORS[m.relation] || '#6b7280'
                    const icon = RELATION_ICONS[m.relation] || 'bi-person'
                    return (
                      <div key={m.id} className="col-md-6">
                        <div className="p-3 border rounded-3 d-flex align-items-center gap-3 h-100"
                             style={{ transition:'all 0.2s' }}>
                          <div style={{ width:'50px',height:'50px',borderRadius:'14px',background:color+'15',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                            <i className={`bi ${icon}`} style={{ color, fontSize:'1.3rem' }}></i>
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <div className="fw-600">{m.fullName}</div>
                            <div className="small text-muted">
                              {m.relation.charAt(0)+m.relation.slice(1).toLowerCase()}
                              {m.gender && ` • ${m.gender.charAt(0)+m.gender.slice(1).toLowerCase()}`}
                              {m.bloodGroup && ` • ${m.bloodGroup}`}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ borderRadius:'8px', padding:'4px 8px' }}
                            onClick={() => handleDelete(m.id)}
                            title="Remove member"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}