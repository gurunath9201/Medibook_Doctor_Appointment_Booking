import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export default function PaymentPage() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    api.post(`/payments/create-order/${appointmentId}`)
      .then(r => {
        const data = r.data
        if (data.success === false) {
          setError(data.message || 'Payment order creation failed')
        } else if (data.razorpayOrderId) {
          setOrderData(data)  
        } else if (data.data) {
          setOrderData(data.data) 
        } else {
          setError('Unexpected response format')
        }
      })
      .catch(e => {
        setError(e.response?.data?.message || 'Failed to create payment order')
      })
      .finally(() => setLoading(false))
  }, [appointmentId])

  const handlePay = async () => {
    if (!orderData) return
    setPaying(true)

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.')
      setPaying(false)
      return
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'MediBook',
      description: `Consultation with ${orderData.doctorName}`,
      order_id: orderData.razorpayOrderId,
      handler: async (response) => {
        try {
          await api.post('/payments/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            appointmentId: parseInt(appointmentId)
          })
          navigate('/patient/appointments?payment=success')
        } catch (e) {
          alert('Payment verification failed. Please contact support.')
          navigate('/patient/appointments')
        }
      },
      prefill: {
        name: orderData.patientName || '',
        email: '',
        contact: ''
      },
      theme: { color: '#0d6efd' },
      modal: {
        ondismiss: () => setPaying(false)
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', function () {
      alert('Payment failed. Please try again.')
      setPaying(false)
    })
    rzp.open()
  }

  if (loading) return <div className="medibook-spinner"><div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} /></div>
  if (error) return (
    <div className="container py-5 text-center">
      <div className="medibook-card p-4 d-inline-block">
        <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
        <h5 className="mt-3">Payment Error</h5>
        <p className="text-muted">{error}</p>
        <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-credit-card me-3"></i>Payment</h1>
          <p className="mb-0 opacity-75">Complete your appointment payment securely</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="medibook-card p-4">
              <div className="text-center mb-4">
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#f0fdf4', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-shield-lock-fill text-success fs-2"></i>
                </div>
                <h5 className="fw-700">Secure Payment</h5>
                <p className="text-muted small">Powered by Razorpay — India's most trusted payment gateway</p>
              </div>

              <div className="bg-light rounded-3 p-3 mb-4">
                <table className="table table-borderless mb-0 small">
                  <tbody>
                    <tr><td className="text-muted">Doctor</td><td className="fw-600 text-end">{orderData?.doctorName}</td></tr>
                    <tr><td className="text-muted">Patient</td><td className="fw-600 text-end">{orderData?.patientName}</td></tr>
                    <tr><td className="text-muted">Payment Methods</td><td className="fw-600 text-end">UPI, Card, NetBanking</td></tr>
                    <tr className="border-top">
                      <td className="fw-700">Total Amount</td>
                      <td className="fw-700 text-success text-end fs-5">₹{orderData ? (orderData.amount / 100) : '---'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="d-flex gap-2 mb-4 flex-wrap justify-content-center">
                {['UPI', 'Visa', 'Mastercard', 'NetBanking', 'Wallet'].map(m => (
                  <span key={m} className="badge bg-light text-dark border px-2 py-1">{m}</span>
                ))}
              </div>

              <button className="btn btn-medibook w-100 py-3" onClick={handlePay} disabled={paying} style={{ fontSize: '1.1rem' }}>
                {paying ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                ) : (
                  <><i className="bi bi-lock-fill me-2"></i>Pay ₹{orderData ? (orderData.amount / 100) : '---'} Securely</>
                )}
              </button>

              <div className="text-center mt-3 small text-muted">
                <i className="bi bi-shield-check me-1 text-success"></i>
                256-bit SSL encrypted payment. Your data is safe.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}