import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('medibook_token')
    const savedUser = localStorage.getItem('medibook_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('medibook_token', jwtToken)
    localStorage.setItem('medibook_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('medibook_token')
    localStorage.removeItem('medibook_user')
  }

  const hasRole = (role) => user?.roles?.includes(role)
  const isPatient = () => hasRole('ROLE_PATIENT')
  const isDoctor = () => hasRole('ROLE_DOCTOR')
  const isAdmin = () => hasRole('ROLE_ADMIN')

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole, isPatient, isDoctor, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)