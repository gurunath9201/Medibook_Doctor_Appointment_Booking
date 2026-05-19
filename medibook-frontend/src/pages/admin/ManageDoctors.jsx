import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function AdminSidebar({ active }) {
  const links = [
    { to: '/admin/dashboard',    icon: 'bi-grid',           label: 'Dashboard' },
    { to: '/admin/doctors',      icon: 'bi-person-badge',   label: 'Manage Doctors' },
    { to: '/admin/appointments', icon: 'bi-calendar-check', label: 'All Appointments' },
  ]
  return (
    <div className="dashboard-sidebar">
      <div className="text-muted small fw-600 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>
        Admin Menu
      </div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${active === l.to ? 'active' : ''}`}>
          <i className={l.icon}></i>{l.label}
        </Link>
      ))}
    </div>
  )
}

const SPECIALIZATIONS = [
  { id: 1, name: 'Cardiologist' },
  { id: 2, name: 'Dermatologist' },
  { id: 3, name: 'Orthopedic' },
  { id: 4, name: 'Pediatrician' },
  { id: 5, name: 'Neurologist' },
  { id: 6, name: 'Gynecologist' },
  { id: 7, name: 'ENT Specialist' },
  { id: 8, name: 'Psychiatrist' },
  { id: 9, name: 'Diabetologist' },
  { id: 10, name: 'General Physician' },
]

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [actionMsg, setActionMsg] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', city: '', state: '',
    registrationNumber: '', experienceYears: '', qualification: '',
    consultationFee: '', bio: '', languagesSpoken: '',
    specializationIds: [],
    clinicName: '', clinicAddress: '', clinicCity: ''
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/doctors')
      setDoctors(res.data || [])
    } catch (e) {
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingDoctor(null)
    setForm({
      fullName: '', email: '', password: '', phone: '', city: '', state: '',
      registrationNumber: '', experienceYears: '', qualification: '',
      consultationFee: '', bio: '', languagesSpoken: '',
      specializationIds: [],
      clinicName: '', clinicAddress: '', clinicCity: ''
    })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor)
    setForm({
      fullName: doctor.user?.fullName || '',
      email: doctor.user?.email || '',
      password: '', 
      phone: doctor.user?.phone || '',
      city: doctor.user?.city || '',
      state: doctor.user?.state || '',
      registrationNumber: doctor.registrationNumber || '',
      experienceYears: doctor.experienceYears || '',
      qualification: doctor.qualification || '',
      consultationFee: doctor.consultationFee || '',
      bio: doctor.bio || '',
      languagesSpoken: doctor.languagesSpoken || '',
      specializationIds: doctor.specializations?.map(s => s.id) || [],
      clinicName: doctor.clinic?.name || '',
      clinicAddress: doctor.clinic?.address || '',
      clinicCity: doctor.clinic?.city || ''
    })
    setFormError('')
    setShowModal(true)
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSpecChange = (specId) => (e) => {
    const checked = e.target.checked
    setForm(prev => {
      if (checked) {
        return { ...prev, specializationIds: [...prev.specializationIds, specId] }
      } else {
        return { ...prev, specializationIds: prev.specializationIds.filter(id => id !== specId) }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.registrationNumber || !form.qualification) {
      setFormError('Please fill required fields: Full Name, Email, Registration Number, Qualification.')
      return
    }
    if (!editingDoctor && !form.password) {
      setFormError('Password is required for new doctor.')
      return
    }
    setSaving(true)
    setFormError('')
    const payload = {
      ...form,
      experienceYears: parseInt(form.experienceYears) || 0,
      consultationFee: parseFloat(form.consultationFee) || 500,
      specializationIds: form.specializationIds
    }
    try {
      if (editingDoctor) {
        await api.put(`/admin/doctors/${editingDoctor.id}/update`, payload)
        showMsg('Doctor updated successfully!')
      } else {
        await api.post('/admin/doctors/add', payload)
        showMsg('Doctor added successfully!')
      }
      setShowModal(false)
      fetchDoctors()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This will also delete the user account.')) return
    try {
      await api.delete(`/admin/doctors/${id}/delete`)
      showMsg('Doctor deleted successfully!')
      fetchDoctors()
    } catch (err) {
      alert('Failed to delete doctor')
    }
  }

  const approveDoctor = async (id) => {
    try {
      await api.put(`/admin/doctors/${id}/approve`)
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, isApproved: true, isAvailable: true } : d))
      showMsg('Doctor approved!')
    } catch (e) { alert('Approval failed') }
  }

  const rejectDoctor = async (id) => {
    if (!window.confirm('Reject this doctor?')) return
    try {
      await api.put(`/admin/doctors/${id}/reject`)
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, isApproved: false, isAvailable: false } : d))
      showMsg('Doctor rejected.')
    } catch (e) { alert('Rejection failed') }
  }

  const toggleAvailability = async (id, current) => {
    try {
      await api.put(`/admin/doctors/${id}/toggle-availability`)
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, isAvailable: !current } : d))
    } catch (e) { alert('Failed to toggle') }
  }

  const showMsg = (msg) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(''), 3000)
  }

  const filtered = doctors.filter(d => {
    const matchFilter =
      filter === 'ALL' ||
      (filter === 'APPROVED' && d.isApproved) ||
      (filter === 'PENDING' && !d.isApproved)
    const matchSearch =
      search === '' ||
      d.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.registrationNumber?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-person-badge me-3"></i>Manage Doctors</h1>
          <p className="mb-0 opacity-75">Add, edit, approve and manage doctor accounts</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3">
            <AdminSidebar active="/admin/doctors" />
          </div>

          <div className="col-lg-9">
            {actionMsg && (
              <div className="alert alert-success medibook-alert mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill"></i>{actionMsg}
              </div>
            )}

            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search doctor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '220px' }}
                />
                <div className="d-flex gap-2">
                  {['ALL', 'APPROVED', 'PENDING'].map(f => (
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
              <button className="btn btn-success" style={{ borderRadius: '10px' }} onClick={openAddModal}>
                <i className="bi bi-plus-circle me-2"></i>Add Doctor
              </button>
            </div>

            {loading ? (
              <div className="medibook-spinner py-4"><div className="spinner-border text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5 text-muted">No doctors found</div>
            ) : (
              <div className="table-responsive">
                <table className="table medibook-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Experience</th>
                      <th>Fee</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(d => {
                      const initials = d.user?.fullName
                        ? d.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : 'DR'
                      return (
                        <tr key={d.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'linear-gradient(135deg,#0d6efd,#0d9488)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0
                              }}>
                                {initials}
                              </div>
                              <div>
                                <div className="fw-600 small">Dr. {d.user?.fullName}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{d.user?.email}</div>
                                <div className="text-muted" style={{ fontSize: '0.72rem' }}>{d.qualification}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {(d.specializations || []).slice(0, 2).map(s => (
                              <span key={s.id} className="spec-badge" style={{ fontSize: '0.72rem' }}>{s.name}</span>
                            ))}
                          </td>
                          <td className="small">{d.experienceYears} yrs</td>
                          <td className="fw-700 text-success small">₹{d.consultationFee}</td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {d.isApproved ? (
                                <span className="status-badge status-confirmed" style={{ fontSize: '0.7rem' }}>Approved</span>
                              ) : (
                                <span className="status-badge status-pending" style={{ fontSize: '0.7rem' }}>Pending</span>
                              )}
                              <span className="small" style={{ fontSize: '0.72rem', color: d.isAvailable ? '#22c55e' : '#94a3b8' }}>
                                {d.isAvailable ? '● Available' : '○ Unavailable'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              {!d.isApproved && (
                                <>
                                  <button className="btn btn-sm btn-success" onClick={() => approveDoctor(d.id)}>
                                    <i className="bi bi-check"></i>
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => rejectDoctor(d.id)}>
                                    <i className="bi bi-x"></i>
                                  </button>
                                </>
                              )}
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleAvailability(d.id, d.isAvailable)}>
                                {d.isAvailable ? 'Disable' : 'Enable'}
                              </button>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(d)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d.id)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-700">
                  {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body medibook-form" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {formError && <div className="alert alert-danger">{formError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Full Name*</label>
                      <input type="text" className="form-control" value={form.fullName} onChange={handleChange('fullName')} required placeholder='Enter Full Name'/>
                    </div>
                    <div className="col-md-6">
                      <label>Email*</label>
                      <input type="email" className="form-control" value={form.email} onChange={handleChange('email')} required disabled={!!editingDoctor} placeholder='Enter Your Email'/>
                    </div>
                    <div className="col-md-6">
                      <label>Password {editingDoctor ? '(leave blank to keep unchanged)' : '*'}</label>
                      <input type="password" className="form-control" value={form.password} onChange={handleChange('password')} required={!editingDoctor} placeholder='Enter Password'/>
                    </div>
                    <div className="col-md-6">
                      <label>Phone No*</label>
                      <input type="text" className="form-control" value={form.phone} onChange={handleChange('phone')} placeholder='Enter Phone Number' required/>
                    </div>
                    <div className="col-md-6">
                      <label>City*</label>
                      <input type="text" className="form-control" value={form.city} onChange={handleChange('city')} placeholder='Enter City' required/>
                    </div>
                    <div className="col-md-6">
                      <label>State*</label>
                      <input type="text" className="form-control" value={form.state} onChange={handleChange('state')} placeholder='Enter State' required/>
                    </div>
                    <div className="col-md-6">
                      <label>Registration Number*</label>
                      <input type="text" className="form-control" value={form.registrationNumber} onChange={handleChange('registrationNumber')} placeholder='Enter Registration Number' required />
                    </div>
                    <div className="col-md-6">
                      <label>Experience (years)*</label>
                      <input type="number" className="form-control" value={form.experienceYears} onChange={handleChange('experienceYears')} placeholder='Enter Experience' required/>
                    </div>
                    <div className="col-md-6">
                      <label>Qualification*</label>
                      <input type="text" className="form-control" value={form.qualification} onChange={handleChange('qualification')} placeholder='Enter Qualification' required />
                    </div>
                    <div className="col-md-6">
                      <label>Consultation Fee (₹)*</label>
                      <input type="number" className="form-control" value={form.consultationFee} onChange={handleChange('consultationFee')} placeholder='Enter Consultation Fee' required/>
                    </div>
                    <div className="col-12">
                      <label>Bio*</label>
                      <textarea className="form-control" rows="2" value={form.bio} onChange={handleChange('bio')} placeholder='Enter Bio' required></textarea>
                    </div>
                    <div className="col-md-6">
                      <label>Languages Spoken*</label>
                      <input type="text" className="form-control" placeholder="Enter Languages" value={form.languagesSpoken} onChange={handleChange('languagesSpoken')} required/>
                    </div>
                    <div className="col-12">
                      <label>Specializations*</label>
                      <div className="d-flex flex-wrap gap-2">
                        {SPECIALIZATIONS.map(spec => (
                          <label key={spec.id} className="d-flex align-items-center gap-1">
                            <input
                              type="checkbox"
                              checked={form.specializationIds.includes(spec.id)}
                              onChange={handleSpecChange(spec.id)} placeholder='Enter Specialization'
                            />
                            <span style={{ fontSize: '0.85rem' }}>{spec.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="col-12"><hr /><h6>Clinic Information (optional)</h6></div>
                    <div className="col-md-6">
                      <label>Clinic Name</label>
                      <input type="text" className="form-control" value={form.clinicName} onChange={handleChange('clinicName')} placeholder='Enter Clinic Name'/>
                    </div>
                    <div className="col-md-6">
                      <label>Clinic City</label>
                      <input type="text" className="form-control" value={form.clinicCity} onChange={handleChange('clinicCity')} placeholder='Enter Clinic City'/>
                    </div>
                    <div className="col-12">
                      <label>Clinic Address</label>
                      <input type="text" className="form-control" value={form.clinicAddress} onChange={handleChange('clinicAddress')} placeholder='Enter Clinic Address'/>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-medibook" disabled={saving}>
                      {saving ? <span className="spinner-border spinner-border-sm me-2" /> : ''}
                      {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}