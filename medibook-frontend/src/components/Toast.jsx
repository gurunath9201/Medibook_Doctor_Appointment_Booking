import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: '80px', right: '20px',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
        maxWidth: '360px', width: '100%'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'success' ? '#fff' :
                          toast.type === 'error'   ? '#fff' :
                          toast.type === 'warning' ? '#fff' : '#fff',
              border: `1px solid ${
                toast.type === 'success' ? '#22c55e' :
                toast.type === 'error'   ? '#ef4444' :
                toast.type === 'warning' ? '#f59e0b' : '#0d6efd'
              }`,
              borderLeft: `4px solid ${
                toast.type === 'success' ? '#22c55e' :
                toast.type === 'error'   ? '#ef4444' :
                toast.type === 'warning' ? '#f59e0b' : '#0d6efd'
              }`,
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'slideIn 0.3s ease',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: toast.type === 'success' ? '#f0fdf4' :
                          toast.type === 'error'   ? '#fef2f2' :
                          toast.type === 'warning' ? '#fffbeb' : '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <i className={`bi ${
                toast.type === 'success' ? 'bi-check-circle-fill text-success' :
                toast.type === 'error'   ? 'bi-x-circle-fill text-danger' :
                toast.type === 'warning' ? 'bi-exclamation-triangle-fill text-warning' :
                'bi-info-circle-fill text-primary'
              }`} style={{ fontSize: '1rem' }}></i>
            </div>
            <div className="flex-grow-1">
              <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1e293b' }}>
                {toast.type === 'success' ? 'Success' :
                 toast.type === 'error'   ? 'Error' :
                 toast.type === 'warning' ? 'Warning' : 'Info'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', flexShrink: 0 }}
            >
              <i className="bi bi-x fs-5"></i>
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}