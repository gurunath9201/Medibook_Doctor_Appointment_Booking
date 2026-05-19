import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DoctorList from './pages/DoctorList'
import DoctorDetail from './pages/DoctorDetail'
import BookAppointment from './pages/BookAppointment'
import PaymentPage from './pages/PaymentPage'

import About from './pages/About'
import Contact from './pages/Contact'

import PatientDashboard from './pages/patient/PatientDashboard'
import MyAppointments from './pages/patient/MyAppointments'
import MedicalHistory from './pages/patient/MedicalHistory'
import FamilyMembers from './pages/patient/FamilyMembers'

import DoctorDashboard from './pages/doctor/DoctorDashboard'
import ScheduleManager from './pages/doctor/ScheduleManager'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorEarnings from './pages/doctor/DoctorEarnings'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageDoctors from './pages/admin/ManageDoctors'
import AllAppointments from './pages/admin/AllAppointments'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="medibook-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (role && !user.roles?.includes(role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/book/:doctorId" element={<ProtectedRoute role="ROLE_PATIENT"><BookAppointment /></ProtectedRoute>} />
        <Route path="/payment/:appointmentId" element={<ProtectedRoute role="ROLE_PATIENT"><PaymentPage /></ProtectedRoute>} />
        <Route path="/patient/dashboard" element={<ProtectedRoute role="ROLE_PATIENT"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute role="ROLE_PATIENT"><MyAppointments /></ProtectedRoute>} />
        <Route path="/patient/medical-history" element={<ProtectedRoute role="ROLE_PATIENT"><MedicalHistory /></ProtectedRoute>} />
        <Route path="/patient/family" element={<ProtectedRoute role="ROLE_PATIENT"><FamilyMembers /></ProtectedRoute>} />

        <Route path="/doctor/dashboard" element={<ProtectedRoute role="ROLE_DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/schedule" element={<ProtectedRoute role="ROLE_DOCTOR"><ScheduleManager /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute role="ROLE_DOCTOR"><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/earnings" element={<ProtectedRoute role="ROLE_DOCTOR"><DoctorEarnings /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute role="ROLE_ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute role="ROLE_ADMIN"><ManageDoctors /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute role="ROLE_ADMIN"><AllAppointments /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}