import { API_CONFIG } from './config.js'

/**
 * Admin credentials for testing
 */
export const ADMIN_CREDENTIALS = {
  email: 'Admin88@gmail.com',
  password: 'Admin@3347'
}

/**
 * Check if current user is admin
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = () => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.role === 'admin'
    }
    return false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get current user data
 * @returns {Object|null} - User data or null
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      return JSON.parse(userData)
    }
    return null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}
