import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function DoctorSidebar({ active }) {
  const links = [
    { to:'/doctor/dashboard',    icon:'bi-grid',           label:'Dashboard' },
    { to:'/doctor/appointments', icon:'bi-calendar-check', label:'Appointments' },
    { to:'/doctor/schedule',     icon:'bi-clock',          label:'My Schedule' },
    { to:'/doctor/earnings',     icon:'bi-cash-stack',     label:'Earnings' },
  ]
  return (
    <div className="dashboard-sidebar">
      <div className="text-muted small fw-600 mb-3 text-uppercase" style={{ letterSpacing:'1px' }}>Doctor Menu</div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${active===l.to?'active':''}`}>
          <i className={l.icon}></i>{l.label}
        </Link>
      ))}
    </div>
  )
}

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']

const defaultForm = () => DAYS.reduce((acc, d) => ({
  ...acc,
  [d]: { enabled:false, startTime:'09:00', endTime:'17:00', slotDurationMinutes:30, maxPatients:20 }
}), {})

export default function ScheduleManager() {
  const [form, setForm] = useState(defaultForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text:'', type:'' })
  const [leaveDate, setLeaveDate] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveMsg, setLeaveMsg] = useState({ text:'', type:'' })

  useEffect(() => {
    api.get('/doctor/schedule')
      .then(r => {
        const data = r.data || []
        const updated = defaultForm()
        data.forEach(s => {
          if (updated[s.dayOfWeek]) {
            updated[s.dayOfWeek] = {
              enabled: s.isActive,
              startTime: s.startTime,
              endTime: s.endTime,
              slotDurationMinutes: s.slotDurationMinutes,
              maxPatients: s.maxPatients,
            }
          }
        })
        setForm(updated)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setDay = (day, field, value) =>
    setForm(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))

  const saveSchedule = async () => {
    setSaving(true)
    setMsg({ text:'', type:'' })
    try {
      const schedules = DAYS.filter(d => form[d].enabled).map(d => ({
        dayOfWeek: d,
        startTime: form[d].startTime,
        endTime: form[d].endTime,
        slotDurationMinutes: form[d].slotDurationMinutes,
        maxPatients: form[d].maxPatients,
        isActive: true,
      }))
      await api.post('/doctor/schedule', { schedules })
      setMsg({ text:'Schedule saved successfully!', type:'success' })
    } catch (e) {
      setMsg({ text:'Failed to save schedule. Please try again.', type:'danger' })
    } finally { setSaving(false) }
  }

  const addLeave = async (e) => {
    e.preventDefault()
    setLeaveMsg({ text:'', type:'' })
    try {
      await api.post('/doctor/leave', { leaveDate, reason: leaveReason })
      setLeaveMsg({ text:'Leave marked successfully!', type:'success' })
      setLeaveDate('')
      setLeaveReason('')
    } catch (e) {
      setLeaveMsg({ text:'Failed to mark leave.', type:'danger' })
    }
  }

  if (loading) return <div className="medibook-spinner" style={{ minHeight:'60vh' }}><div className="spinner-border text-primary" /></div>

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-calendar-week me-3"></i>Schedule Manager</h1>
          <p className="mb-0 opacity-75">Set your weekly availability and manage leaves</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3"><DoctorSidebar active="/doctor/schedule" /></div>
          <div className="col-lg-9">
            <div className="medibook-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-700 mb-0" style={{ fontWeight:'700' }}>
                  <i className="bi bi-calendar-week me-2 text-primary"></i>Weekly Schedule
                </h6>
                <button className="btn btn-medibook btn-sm" onClick={saveSchedule} disabled={saving} style={{ borderRadius:'10px' }}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-save me-2"></i>}
                  {saving ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>

              {msg.text && (
                <div className={`alert alert-${msg.type} medibook-alert mb-3`}>
                  <i className={`bi ${msg.type==='success'?'bi-check-circle':'bi-exclamation-circle'} me-2`}></i>
                  {msg.text}
                </div>
              )}

              <div className="table-responsive">
                <table className="table medibook-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width:'120px' }}>Day</th>
                      <th style={{ width:'80px' }}>Active</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Slot (min)</th>
                      <th>Max Patients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} className={!form[day].enabled ? 'table-light' : ''}>
                        <td className="fw-600" style={{ fontSize:'0.88rem' }}>
                          {day.charAt(0)+day.slice(1).toLowerCase()}
                        </td>
                        <td>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={form[day].enabled}
                              onChange={e => setDay(day,'enabled',e.target.checked)}
                              style={{ cursor:'pointer' }}
                            />
                          </div>
                        </td>
                        <td>
                          <input type="time" className="form-control form-control-sm"
                            style={{ width:'120px', borderRadius:'8px' }}
                            value={form[day].startTime}
                            disabled={!form[day].enabled}
                            onChange={e => setDay(day,'startTime',e.target.value)} />
                        </td>
                        <td>
                          <input type="time" className="form-control form-control-sm"
                            style={{ width:'120px', borderRadius:'8px' }}
                            value={form[day].endTime}
                            disabled={!form[day].enabled}
                            onChange={e => setDay(day,'endTime',e.target.value)} />
                        </td>
                        <td>
                          <select className="form-select form-select-sm"
                            style={{ width:'100px', borderRadius:'8px' }}
                            value={form[day].slotDurationMinutes}
                            disabled={!form[day].enabled}
                            onChange={e => setDay(day,'slotDurationMinutes',parseInt(e.target.value))}>
                            {[15,20,30,45,60].map(m => <option key={m} value={m}>{m} min</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="number" className="form-control form-control-sm"
                            style={{ width:'90px', borderRadius:'8px' }}
                            value={form[day].maxPatients}
                            disabled={!form[day].enabled}
                            min={1} max={50}
                            onChange={e => setDay(day,'maxPatients',parseInt(e.target.value))} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 small text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Enable days and set your working hours. Slots will be automatically generated when patients search.
              </div>
            </div>

            <div className="medibook-card p-4">
              <h6 className="fw-700 mb-4" style={{ fontWeight:'700' }}>
                <i className="bi bi-calendar-x me-2 text-danger"></i>Mark Leave / Holiday
              </h6>
              {leaveMsg.text && (
                <div className={`alert alert-${leaveMsg.type} medibook-alert mb-3`}>
                  <i className={`bi ${leaveMsg.type==='success'?'bi-check-circle':'bi-exclamation-circle'} me-2`}></i>
                  {leaveMsg.text}
                </div>
              )}
              <form onSubmit={addLeave} className="medibook-form">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label>Leave Date *</label>
                    <input type="date" className="form-control"
                      min={new Date().toISOString().split('T')[0]}
                      value={leaveDate}
                      onChange={e => setLeaveDate(e.target.value)} required />
                  </div>
                  <div className="col-md-5">
                    <label>Reason <span className="text-muted">(Optional)</span></label>
                    <input type="text" className="form-control"
                      placeholder="Personal, Emergency, Conference..."
                      value={leaveReason}
                      onChange={e => setLeaveReason(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn btn-danger w-100" style={{ borderRadius:'10px' }}>
                      <i className="bi bi-calendar-minus me-2"></i>Mark Leave
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}