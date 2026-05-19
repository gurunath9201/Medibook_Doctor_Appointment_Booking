import React, { useState, useEffect } from 'react'
import api from '../api/axios'

export default function SlotPicker({ doctorId, selectedDate, onSlotSelect, selectedSlotId }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (doctorId && selectedDate) {
      fetchSlots()
    } else {
      setSlots([])
    }
  }, [doctorId, selectedDate])

  const fetchSlots = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/slots/${doctorId}?date=${selectedDate}`)
      setSlots(res.data || [])
    } catch (e) {
      setError('Could not load slots. Please try again.')
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  if (!selectedDate) {
    return (
      <div className="text-center py-3 text-muted">
        <i className="bi bi-calendar3 fs-3 d-block mb-2 opacity-50"></i>
        <span style={{ fontSize: '0.9rem' }}>Please select a date first</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted py-2">
        <div className="spinner-border spinner-border-sm text-primary" />
        <span style={{ fontSize: '0.9rem' }}>Loading available slots...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger medibook-alert py-2 small">
        <i className="bi bi-exclamation-circle me-2"></i>{error}
      </div>
    )
  }

  const available = slots.filter(s => !s.isBooked && !s.isBlocked)
  const morning   = available.filter(s => parseInt(s.startTime) < 12)
  const afternoon = available.filter(s => {
    const h = parseInt(s.startTime)
    return h >= 12 && h < 17
  })
  const evening   = available.filter(s => parseInt(s.startTime) >= 17)

  if (available.length === 0) {
    return (
      <div className="alert alert-warning medibook-alert py-2 small">
        <i className="bi bi-calendar-x me-2"></i>
        No slots available for {selectedDate}. Try another date.
      </div>
    )
  }

  const SlotGroup = ({ label, icon, slotList }) => {
    if (slotList.length === 0) return null
    return (
      <div className="mb-3">
        <div className="text-muted small fw-600 mb-2">
          <i className={`bi ${icon} me-1`}></i>{label} ({slotList.length} available)
        </div>
        <div className="d-flex flex-wrap gap-2">
          {slotList.map(slot => {
            const isSelected = selectedSlotId === slot.id
            return (
              <button
                key={slot.id}
                type="button"
                className={`slot-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onSlotSelect && onSlotSelect(slot)}
                style={isSelected ? {
                  background: 'linear-gradient(135deg,#0d6efd,#0d9488)',
                  color: '#fff', border: '2px solid #0d6efd'
                } : {}}
              >
                <i className="bi bi-clock me-1"></i>
                {slot.startTime?.slice(0, 5)}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="small text-muted">
          <i className="bi bi-check-circle text-success me-1"></i>
          {available.length} slot{available.length !== 1 ? 's' : ''} available
        </span>
        <span className="small text-muted">
          {selectedDate}
        </span>
      </div>
      <SlotGroup label="Morning"   icon="bi-sunrise"    slotList={morning} />
      <SlotGroup label="Afternoon" icon="bi-sun"        slotList={afternoon} />
      <SlotGroup label="Evening"   icon="bi-sunset"     slotList={evening} />
    </div>
  )
}