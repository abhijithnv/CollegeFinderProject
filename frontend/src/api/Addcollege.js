import { API_CONFIG, fetchWithTimeout } from './config.js'

/**
 * Get all colleges
 * @returns {Promise<Array>} - List of colleges
 */
export const getColleges = async () => {
  try {
    console.log('Fetching colleges...')
    
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/college/`, {
      method: 'GET',
    })

    console.log('Get colleges response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }
      console.error('Get colleges failed:', errorData)
      
      const error = new Error(errorData.detail || `Get colleges failed with status ${response.status}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    const data = await response.json()
    console.log('Colleges fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Get colleges error:', error)
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new Error('Request timeout: The server took too long to respond. Please try again.')
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

/**
 * Get college by ID
 * @param {number} collegeId - College ID
 * @returns {Promise<Object>} - College details
 */
export const getCollegeById = async (collegeId) => {
  try {
    console.log('Fetching college with ID:', collegeId)
    
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/college/${collegeId}`, {
      method: 'GET',
    })

    console.log('Get college response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }
      console.error('Get college failed:', errorData)
      
      const error = new Error(errorData.detail || `Get college failed with status ${response.status}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    const data = await response.json()
    console.log('College fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Get college error:', error)
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new Error('Request timeout: The server took too long to respond. Please try again.')
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

/**
 * Add college function
 * @param {Object} collegeData - College data for creation
 * @param {string} collegeData.college_name - College name
 * @param {string} collegeData.category - Category (Engineering, etc.)
 * @param {string} collegeData.address - College address
 * @param {string} collegeData.about - About college
 * @param {string} collegeData.stream - Stream (Computer Science, etc.)
 * @param {string} collegeData.price_range - Price range
 * @param {string} collegeData.course_name - Course name
 * @param {string} collegeData.course_about - Course description
 * @param {string} collegeData.sem1_fee - Semester 1 fee
 * @param {string} collegeData.sem2_fee - Semester 2 fee
 * @param {string} collegeData.sem3_fee - Semester 3 fee
 * @param {string} collegeData.sem4_fee - Semester 4 fee
 * @param {string} collegeData.sem5_fee - Semester 5 fee
 * @param {string} collegeData.sem6_fee - Semester 6 fee
 * @param {string} collegeData.sem7_fee - Semester 7 fee
 * @param {string} collegeData.sem8_fee - Semester 8 fee
 * @param {File} collegeData.college_image_file - College image file
 * @returns {Promise<Object>} - College creation response
 */
export const addCollege = async (collegeData) => {
  try {
    console.log('Adding college:', collegeData.college_name)
    
    // Create FormData for multipart/form-data submission
    const formData = new FormData()
    
    // Add all text fields
    formData.append('college_name', collegeData.college_name)
    formData.append('address', collegeData.address)
    formData.append('about', collegeData.about)
    formData.append('stream', collegeData.stream)
    formData.append('price_range', collegeData.price_range)
    formData.append('courses', collegeData.courses)
    
    // Add image file if provided
    if (collegeData.college_image_file) {
      formData.append('college_image_file', collegeData.college_image_file)
    }
    
    // Debug: Log all FormData values
    console.log('FormData contents:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value} (type: ${typeof value})`)
    }
    
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/college/`, {
      method: 'POST',
      body: formData, // Don't set Content-Type header, let browser set it with boundary
    }, 90000) // 90 seconds timeout for adding college with multiple courses

    console.log('Add college response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (parseError) {
        // If response is not JSON, create a generic error
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }
      
      console.error('Add college failed:', errorData)
      
      // Handle validation errors (422)
      if (response.status === 422) {
        console.log('Full error data:', errorData)
        if (Array.isArray(errorData)) {
          const errorMessages = errorData.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
          const error = new Error(`Validation errors: ${errorMessages}`)
          error.status = response.status
          error.data = errorData
          throw error
        } else if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
          const error = new Error(`Validation errors: ${errorMessages}`)
          error.status = response.status
          error.data = errorData
          throw error
        }
      }
      
      // Handle timeout errors (504)
      if (response.status === 504) {
        throw new Error('Request timeout: The server took too long to process your request. Please try again with fewer courses or check your connection.')
      }
      
      // Handle server errors (500)
      if (response.status === 500) {
        throw new Error(errorData.detail || 'Server error: Failed to add college. Please try again later.')
      }
      
      const error = new Error(errorData.detail || `Add college failed with status ${response.status}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    const data = await response.json()
    console.log('College added successfully:', data)
    return data
  } catch (error) {
    console.error('Add college error:', error)
    // Handle network errors
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new Error('Request timeout: Adding college with multiple courses took too long. Please try again or add courses in smaller batches.')
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

/**
 * Delete college function
 * @param {number} collegeId - College ID to delete
 * @returns {Promise<Object>} - Delete response
 */
export const deleteCollege = async (collegeId) => {
  try {
    console.log('Deleting college with ID:', collegeId)
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/college/${collegeId}`, {
      method: 'DELETE',
    })

    console.log('Delete college response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Delete college failed:', errorData)
      
      const error = new Error(errorData.detail || `Delete college failed with status ${response.status}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    const data = await response.json()
    console.log('College deleted successfully:', data)
    return data
  } catch (error) {
    console.error('Delete college error:', error)
    throw error
  }
}

/**
 * Toggle college like/unlike
 * @param {number} collegeId - College ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Like toggle response
 */
export const toggleCollegeLike = async (collegeId, userId) => {
  try {
    console.log('Toggling like for college:', collegeId, 'user:', userId)
    
    // Create FormData for the request
    const formData = new FormData()
    formData.append('user_id', userId)
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/college/like/${collegeId}`, {
      method: 'POST',
      body: formData,
    })

    console.log('Toggle like response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Toggle like failed:', errorData)
      
      const error = new Error(errorData.detail || `Toggle like failed with status ${response.status}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    const data = await response.json()
    console.log('Like toggled successfully:', data)
    return data
  } catch (error) {
    console.error('Toggle like error:', error)
    throw error
  }
}

/**
 * Get liked colleges for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - List of liked colleges
 */
export const getLikedColleges = async (userId) => {
  try {
    console.log('Fetching liked colleges for user:', userId)
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/college/liked/${userId}`, {
      method: 'GET',
    })

    console.log('Get liked colleges response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Get liked colleges failed:', errorData)
      
      const error = new Error(errorData.detail || `Get liked colleges failed with status ${response.status}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    const data = await response.json()
    console.log('Liked colleges fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Get liked colleges error:', error)
    throw error
  }
}

// Add college to compare list
export const addToCompare = async (userId, collegeId) => {
  try {
    console.log('Adding college to compare:', { userId, collegeId })
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/college/compare/${userId}/${collegeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Add to compare response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.log('Add to compare failed:', errorData)
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('College added to compare successfully:', data)
    return data
  } catch (error) {
    console.error('Add to compare error:', error)
    throw error
  }
}

// Get user's compare list
export const getCompareList = async (userId) => {
  try {
    console.log('Fetching compare list for user:', userId)
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/college/compare/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Get compare list response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.log('Get compare list failed:', errorData)
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Compare list fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Get compare list error:', error)
    throw error
  }
}

// Remove college from compare list
export const removeFromCompare = async (userId, collegeId) => {
  try {
    console.log('Removing college from compare:', { userId, collegeId })
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/college/compare/${userId}/${collegeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Remove from compare response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.log('Remove from compare failed:', errorData)
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('College removed from compare successfully:', data)
    return data
  } catch (error) {
    console.error('Remove from compare error:', error)
    throw error
  }
}