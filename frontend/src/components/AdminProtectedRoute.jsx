import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation()
  
  // Check if user is authenticated and has admin role
  const isAdminAuthenticated = () => {
    const userData = localStorage.getItem('user')
    if (!userData) return false
    
    try {
      const user = JSON.parse(userData)
      return user && user.role === 'admin' && (user.email || user.username)
    } catch (error) {
      console.error('Error parsing user data:', error)
      return false
    }
  }

  // If user is not authenticated or not admin, redirect to sign-in
  if (!isAdminAuthenticated()) {
    console.log('Access denied: Admin authentication required')
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}

export default AdminProtectedRoute
