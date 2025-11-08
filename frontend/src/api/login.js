import { API_CONFIG, fetchWithTimeout } from './config.js'

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
    
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    })

    console.log('Login response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (parseError) {
        // If response is not JSON, create a generic error
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }
      
      console.error('Login failed:', errorData)
      
      // Handle authentication errors (401)
      if (response.status === 401) {
        const error = new Error('Invalid email or password. Please check your credentials and try again.')
        error.status = response.status
        error.data = errorData
        throw error
      }
      
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
    // Handle network errors
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new Error('Request timeout: The server took too long to respond. Please try again.')
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}
