import { API_CONFIG, fetchWithTimeout } from './config.js'

export const testAPI = async () => {
  try {
    console.log('Testing API connectivity...')
    const response = await fetch(`${API_CONFIG.BASE_URL}/`, {
      method: 'GET',
    })
    console.log('API test response:', response.status, response.statusText)
    return response
  } catch (error) {
    console.error('API test failed:', error)
    throw error
  }
}

/**
 * Register user function
 * @param {Object} userData - User data for registration
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password
 * @returns {Promise<Object>} - Registration response
 */
export const registerUser = async (userData) => {
  try {
    console.log('Registering user:', { username: userData.username, email: userData.email })
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Missing required fields: username, email, or password')
    }
    
    // Trim whitespace from all fields
    const cleanData = {
      username: userData.username.trim(),
      email: userData.email.trim(),
      password: userData.password.trim()
    }
    
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    })

    console.log('Registration response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (parseError) {
        // If response is not JSON, create a generic error
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }
      
      console.error('Registration failed:', errorData)
      
      // Handle validation errors (400)
      if (response.status === 400) {
        const error = new Error(errorData.detail || 'Invalid registration data. Please check your information and try again.')
        error.status = response.status
        error.data = errorData
        throw error
      }
      
      const error = new Error(errorData.detail || `Registration failed with status ${response.status}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    const data = await response.json()
    console.log('Registration successful:', data)
    return data
  } catch (error) {
    console.error('Registration error:', error)
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
