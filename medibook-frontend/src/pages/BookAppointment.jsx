import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [familyMembers, setFamilyMembers] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [form, setForm] = useState({ reasonForVisit: '', familyMemberId: '' })
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then(r => setDoctor(r.data)).catch(() => {})
    api.get('/family-members').then(r => setFamilyMembers(r.data)).catch(() => {})
  }, [doctorId])

  useEffect(() => {
    if (selectedDate) {
      setSlotsLoading(true)
      setSelectedSlot(null)
      api.get(`/slots/${doctorId}?date=${selectedDate}`)
        .then(r => setSlots(r.data || []))
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false))
    }
  }, [selectedDate, doctorId])

  const handleBook = async () => {
    if (!selectedSlot || !form.reasonForVisit) return
    setLoading(true)
    try {
      const res = await api.post('/appointments/book', {
        doctorId: parseInt(doctorId),
        slotId: selectedSlot.id,
        appointmentDate: selectedDate,
        reasonForVisit: form.reasonForVisit,
        familyMemberId: form.familyMemberId || null
      })
      const appointmentId = res.data.data.id
      navigate(`/payment/${appointmentId}`)
    } catch (e) {
      alert(e.response?.data?.message || 'Booking failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (!doctor) return <div className="medibook-spinner"><div className="spinner-border text-primary" /></div>

  const initials = doctor.user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-calendar-plus me-3"></i>Book Appointment</h1>
          <p className="mb-0 opacity-75">with Dr. {doctor.user?.fullName}</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="step-progress mb-4">
          {[{ n: 1, label: 'Date & Slot' }, { n: 2, label: 'Details' }, { n: 3, label: 'Confirm' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="text-center">
                <div className={`step-dot mx-auto ${step > s.n ? 'done' : step === s.n ? 'active' : ''}`}>{step > s.n ? '✓' : s.n}</div>
                <div className="small text-muted mt-1" style={{ fontSize: '0.75rem' }}>{s.label}</div>
              </div>
              {i < 2 && <div className={`step-line ${step > s.n ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            {step === 1 && (
              <div className="medibook-card p-4">
                <h5 className="fw-700 mb-4"><i className="bi bi-calendar3 me-2 text-primary"></i>Select Date & Time Slot</h5>
                <div className="mb-4">
                  <label className="form-label fw-500">Select Date</label>
                  <input type="date" className="form-control" style={{ borderRadius: '10px', maxWidth: '260px' }}
                    min={today} max={maxDate} value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)} />
                </div>

                {selectedDate && (
                  <div>
                    <label className="form-label fw-500 mb-3">Available Slots for {selectedDate}</label>
                    {slotsLoading ? (
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <div className="spinner-border spinner-border-sm" />Loading slots...
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="alert alert-warning rounded-3">
                        <i className="bi bi-calendar-x me-2"></i>No slots available for this date. Please select another date.
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {slots.map(slot => (
                          <button key={slot.id}
                            className={`slot-btn ${selectedSlot?.id === slot.id ? 'active' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                            disabled={slot.isBooked || slot.isBlocked}
                          >
                            <i className="bi bi-clock me-1"></i>
                            {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4">
                  <button className="btn btn-medibook px-4" disabled={!selectedSlot}
                    onClick={() => setStep(2)}>
                    Next: Enter Details <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="medibook-card p-4">
                <h5 className="fw-700 mb-4"><i className="bi bi-clipboard2-pulse me-2 text-primary"></i>Appointment Details</h5>
                <div className="medibook-form">
                  <div className="mb-3">
                    <label>Reason for Visit *</label>
                    <textarea className="form-control" rows="3" placeholder="Describe your symptoms or reason..."
                      value={form.reasonForVisit} onChange={e => setForm({ ...form, reasonForVisit: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label>Booking For</label>
                    <select className="form-select" value={form.familyMemberId}
                      onChange={e => setForm({ ...form, familyMemberId: e.target.value })}>
                      <option value="">Myself ({user?.fullName})</option>
                      {familyMembers.map(f => (
                        <option key={f.id} value={f.id}>{f.fullName} ({f.relation})</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex gap-3">
                    <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                      <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                    <button className="btn btn-medibook px-4" disabled={!form.reasonForVisit}
                      onClick={() => setStep(3)}>
                      Next: Review <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="medibook-card p-4">
                <h5 className="fw-700 mb-4"><i className="bi bi-check-circle me-2 text-success"></i>Review & Confirm</h5>
                <div className="table-responsive mb-4">
                  <table className="table table-borderless">
                    <tbody>
                      {[
                        ['Doctor', `Dr. ${doctor.user?.fullName}`],
                        ['Date', selectedDate],
                        ['Time', `${selectedSlot?.startTime?.slice(0,5)} - ${selectedSlot?.endTime?.slice(0,5)}`],
                        ['For', form.familyMemberId ? familyMembers.find(f => f.id == form.familyMemberId)?.fullName : `Myself (${user?.fullName})`],
                        ['Reason', form.reasonForVisit],
                        ['Fee', `₹${doctor.consultationFee}`],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td className="text-muted fw-500 pe-3" style={{ width: '140px' }}>{k}</td>
                          <td className="fw-600">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="alert alert-info rounded-3 small mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  After booking, you will be redirected to payment. Appointment is confirmed only after successful payment.
                </div>
                <div className="d-flex gap-3">
                  <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>
                    <i className="bi bi-arrow-left me-2"></i>Back
                  </button>
                  <button className="btn btn-medibook px-4" onClick={handleBook} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-lock me-2"></i>}
                    {loading ? 'Booking...' : 'Confirm & Pay ₹' + doctor.consultationFee}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="medibook-card p-4 sticky-top" style={{ top: '80px' }}>
              <h6 className="fw-700 mb-3">Booking Summary</h6>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="doctor-avatar-placeholder" style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>{initials}</div>
                <div>
                  <div className="fw-600">Dr. {doctor.user?.fullName}</div>
                  <div className="small text-muted">{doctor.specializations?.[0]?.name}</div>
                </div>
              </div>
              <hr />
              <div className="small text-muted mb-2 d-flex justify-content-between">
                <span>Date</span><span className="fw-600 text-dark">{selectedDate || '—'}</span>
              </div>
              <div className="small text-muted mb-2 d-flex justify-content-between">
                <span>Time</span><span className="fw-600 text-dark">{selectedSlot ? selectedSlot.startTime?.slice(0,5) : '—'}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-700">
                <span>Total Fee</span>
                <span className="text-success fs-5">₹{doctor.consultationFee}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}