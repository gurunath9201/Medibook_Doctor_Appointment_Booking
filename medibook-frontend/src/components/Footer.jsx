import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="medibook-footer">
      <div className="container">
        <div className="row g-4 pb-4">
          <div className="col-lg-4">
            <h5><i className="bi bi-heart-pulse-fill me-2 text-blue-400"></i>MediBook</h5>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
              Your trusted platform for booking doctor appointments online. Fast, secure, and convenient healthcare at your fingertips.
            </p>
          </div>
          <div className="col-lg-2 col-6">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/doctors">Find Doctors</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-6">
            <h5>Specializations</h5>
            <ul className="list-unstyled">
              {['Cardiologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Neurologist','Gynecologist','ENT Specialist','Psychiatrist','Diabetologist','General Physician'].map(s => (
                <li key={s}><Link to="/doctors">{s}</Link></li>
              ))}
            </ul>
          </div>
          <div className="col-lg-3">
            <h5>Contact</h5>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
              <li className="d-flex align-items-start gap-2 mb-2">
                <i className="bi bi-geo-alt-fill text-primary mt-1"></i>
                <span>Guruwar Peth, Shirala, Tal - Shirala, Dist - Sangli, Maharashtra, India</span>
              </li>
              <li className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-telephone-fill text-primary"></i>
                <span>+91 7028858147</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope-fill text-primary"></i>
                <span>support@medibook.com</span>
              </li>
            </ul>
          </div>
        </div>
        <hr style={{ borderColor: '#334155' }} />
        <div className="text-center pt-2">
          <p className="mb-0" style={{ fontSize: '0.85rem' }}>
            © 2026 MediBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}