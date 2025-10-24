import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const location = useLocation()
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    const userData = localStorage.getItem('user')
    if (!userData) return false
    
    try {
      const user = JSON.parse(userData)
      return user && (user.email || user.username)
    } catch (error) {
      console.error('Error parsing user data:', error)
      return false
    }
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // If route doesn't require authentication but user is authenticated (like sign-in/sign-up pages)
  if (!requireAuth && isAuthenticated()) {
    // Check if user is admin and redirect to admin panel
    const userData = localStorage.getItem('user')
    const user = JSON.parse(userData)
    
    if (user.role === 'admin') {
      return <Navigate to="/admin/colleges" replace />
    } else {
      return <Navigate to="/colleges" replace />
    }
  }

  return children
}

export default ProtectedRoute
