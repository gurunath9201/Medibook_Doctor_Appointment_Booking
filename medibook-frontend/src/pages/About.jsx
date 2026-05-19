import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1><i className="bi bi-info-circle me-3"></i>About Us</h1>
          <p className="mb-0 opacity-75">Learn more about MediBook</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="medibook-card p-4">
              <h4 className="fw-700 mb-3">Our Mission</h4>
              <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                MediBook is a simple and secure platform that helps patients book doctor appointments online.
                We aim to bridge the gap between patients and healthcare professionals by making the entire process —
                from finding a doctor to making payments — fast, transparent, and convenient.
              </p>
              <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                With over 50 verified doctors, 10+ specializations, and secure Razorpay payments,
                MediBook is trusted by thousands of patients across India.
                Our platform supports three roles — Patient, Doctor, and Admin — ensuring that everyone
                has exactly the tools they need.
              </p>
              <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                We are committed to continuous improvement and welcome your feedback.
                Thank you for choosing MediBook for your healthcare needs.
              </p>
              <Link to="/doctors" className="btn btn-medibook mt-3">
                <i className="bi bi-search-heart me-2"></i>Find a Doctor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}