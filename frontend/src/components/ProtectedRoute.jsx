import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user || !user.userId) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // Redirect to correct dashboard based on user's actual role
    const roleMap = {
      'admin': '/admin/dashboard',
      'patient': '/patient/dashboard',
      'doctor': '/doctor/dashboard',
      'insurance': '/insurance/dashboard'
    }
    const correctPath = roleMap[user.role] || '/login'
    return <Navigate to={correctPath} replace />
  }

  return children
}

export default ProtectedRoute

