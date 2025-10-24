import { API_CONFIG } from './config.js'

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
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    })

    console.log('Registration response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Registration failed:', errorData)
      
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
    throw error
  }
}
