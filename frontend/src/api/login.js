import { API_CONFIG } from './config.js'

/**
 * Login user function
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} - Login response
 */
export const loginUser = async (credentials) => {
  try {
    console.log('Logging in user:', { email: credentials.email })
    
    // Validate required fields
    if (!credentials.email || !credentials.password) {
      throw new Error('Missing required fields: email or password')
    }
    
    // Trim whitespace from all fields
    const cleanData = {
      email: credentials.email.trim(),
      password: credentials.password.trim()
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    })

    console.log('Login response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Login failed:', errorData)
      
      const error = new Error(errorData.detail || `Login failed with status ${response.status}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    const data = await response.json()
    console.log('Login successful:', data)
    return data
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}
