import React from 'react'

export default function Contact() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-telephone me-3"></i>Contact Us</h1>
          <p className="mb-0 opacity-75">Get in touch with the MediBook team</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="medibook-card p-4">
              <h4 className="fw-700 mb-4">Contact Information</h4>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-geo-alt-fill text-primary fs-5"></i>
                </div>
                <div>
                  <div className="fw-600">Address</div>
                  <p className="text-muted small mb-0">Guruwar Peth, Shirala, Dist - Sangli, Maharashtra, India</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-telephone-fill text-success fs-5"></i>
                </div>
                <div>
                  <div className="fw-600">Phone</div>
                  <p className="text-muted small mb-0">+91 7028858147</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-envelope-fill text-danger fs-5"></i>
                </div>
                <div>
                  <div className="fw-600">Email</div>
                  <p className="text-muted small mb-0">support@medibook.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}