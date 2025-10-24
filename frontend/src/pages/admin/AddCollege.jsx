import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiTrash2, FiUpload, FiCamera } from 'react-icons/fi'
import AdminLayout from '../../components/AdminLayout'
import { addCollege } from '../../api/Addcollege'

const AddCollege = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    description: '',
    priceRange: '',
    image: null
  })

  const [streams, setStreams] = useState([])
  const [streamInput, setStreamInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(null)

  const [courses, setCourses] = useState([
    {
      id: Date.now(),
      name: '',
      description: '',
      category: '',
      fees: [
        { semester: 'Semester 1', amount: '' }
      ]
    }
  ])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const addStream = () => {
    if (streamInput.trim() && !streams.includes(streamInput.trim())) {
      setStreams(prev => [...prev, streamInput.trim()])
      setStreamInput('')
    }
  }

  const removeStream = (streamToRemove) => {
    setStreams(prev => prev.filter(stream => stream !== streamToRemove))
  }

  const handleStreamKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addStream()
    }
  }

  const addCourse = () => {
    const newCourse = {
      id: Date.now(),
      name: '',
      description: '',
      fees: [
        { semester: 'Semester 1', amount: '' }
      ]
    }
    setCourses(prev => [...prev, newCourse])
  }

  const removeCourse = (courseId) => {
    setCourses(prev => prev.filter(course => course.id !== courseId))
  }

  const updateCourse = (courseId, field, value) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, [field]: value }
        : course
    ))
  }

  const updateCourseCategory = (courseId, category) => {
    const semesterCount = category === 'UG' ? 6 : category === 'PG' ? 4 : 8
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { 
            ...course, 
            category: category,
            fees: Array.from({ length: semesterCount }, (_, index) => ({
              semester: `Semester ${index + 1}`,
              amount: ''
            }))
          }
        : course
    ))
  }

  const addSemesterFee = (courseId) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { 
            ...course, 
            fees: [...course.fees, { semester: `Semester ${course.fees.length + 1}`, amount: '' }]
          }
        : course
    ))
  }

  const removeSemesterFee = (courseId, feeIndex) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { 
            ...course, 
            fees: course.fees.filter((_, index) => index !== feeIndex)
          }
        : course
    ))
  }

  const updateSemesterFee = (courseId, feeIndex, field, value) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { 
            ...course, 
            fees: course.fees.map((fee, index) => 
              index === feeIndex ? { ...fee, [field]: value } : fee
            )
          }
        : course
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Form validation
    if (!formData.name.trim()) {
      alert('Please enter college name')
      setIsLoading(false)
      return
    }
    if (!formData.address.trim()) {
      alert('Please enter college address')
      setIsLoading(false)
      return
    }
    if (!formData.description.trim()) {
      alert('Please enter college description')
      setIsLoading(false)
      return
    }
    if (!formData.priceRange.trim()) {
      alert('Please enter price range')
      setIsLoading(false)
      return
    }
    if (streams.length === 0) {
      alert('Please add at least one stream')
      setIsLoading(false)
      return
    }

    // Check if at least one course has a category
    const hasValidCourse = courses.some(course => course.category && course.name.trim() && course.description.trim())
    if (!hasValidCourse) {
      alert('Please add at least one course with category, name, and description')
      setIsLoading(false)
      return
    }

    // Validate each course
    for (let courseIndex = 0; courseIndex < courses.length; courseIndex++) {
      const course = courses[courseIndex]
      
      if (!course.name.trim()) {
        alert(`Please enter course name for Course ${courseIndex + 1}`)
        setIsLoading(false)
        return
      }
      if (!course.description.trim()) {
        alert(`Please enter course description for Course ${courseIndex + 1}`)
        setIsLoading(false)
        return
      }
      if (!course.category) {
        alert(`Please select category for Course ${courseIndex + 1}`)
        setIsLoading(false)
        return
      }

      // Check semester fees based on course category
      const requiredSemesters = course.category === 'UG' ? 6 : course.category === 'PG' ? 4 : 8
      for (let i = 0; i < requiredSemesters; i++) {
        if (!course.fees[i]?.amount || course.fees[i]?.amount.trim() === '') {
          alert(`Please enter fee for Semester ${i + 1} in Course ${courseIndex + 1}`)
          setIsLoading(false)
          return
        }
      }
    }

    try {
       // Prepare courses data for API
       const coursesData = courses.map(course => {
         const courseData = {
           course_name: course.name,
           course_about: course.description,
           category: course.category,
           sem1_fee: course.fees[0]?.amount && course.fees[0].amount.trim() ? parseFloat(course.fees[0].amount) : null,
           sem2_fee: course.fees[1]?.amount && course.fees[1].amount.trim() ? parseFloat(course.fees[1].amount) : null,
           sem3_fee: course.fees[2]?.amount && course.fees[2].amount.trim() ? parseFloat(course.fees[2].amount) : null,
           sem4_fee: course.fees[3]?.amount && course.fees[3].amount.trim() ? parseFloat(course.fees[3].amount) : null,
         }

         // Add sem5 and sem6 only for UG and Engineering
         if (course.category === 'UG' || course.category === 'Engineering') {
           courseData.sem5_fee = course.fees[4]?.amount && course.fees[4].amount.trim() ? parseFloat(course.fees[4].amount) : null
           courseData.sem6_fee = course.fees[5]?.amount && course.fees[5].amount.trim() ? parseFloat(course.fees[5].amount) : null
         } else {
           courseData.sem5_fee = null
           courseData.sem6_fee = null
         }

         // Add sem7 and sem8 only for Engineering
         if (course.category === 'Engineering') {
           courseData.sem7_fee = course.fees[6]?.amount && course.fees[6].amount.trim() ? parseFloat(course.fees[6].amount) : null
           courseData.sem8_fee = course.fees[7]?.amount && course.fees[7].amount.trim() ? parseFloat(course.fees[7].amount) : null
         } else {
           courseData.sem7_fee = null
           courseData.sem8_fee = null
         }

         return courseData
       })

       // Prepare college data for API
       const collegeData = {
         college_name: formData.name,
         address: formData.address,
         about: formData.description,
         stream: streams[0] || 'General',
         price_range: formData.priceRange,
         courses: JSON.stringify(coursesData),
         college_image_file: formData.image
       }

      console.log('Submitting college data:', collegeData)
      
      const response = await addCollege(collegeData)
      console.log('College added successfully:', response)
      
    alert('College added successfully!')
    navigate('/admin/colleges')
    } catch (error) {
      console.error('Error adding college:', error)
      setError(error.message || 'Failed to add college. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New College</h1>
              <p className="text-gray-600 text-lg">Create a new college entry with detailed information</p>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🏫</span>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* College Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">🏫</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">College Information</h2>
            </div>
            
             <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter college name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College Image
              </label>
               {imagePreview ? (
                 <div className="border-2 border-gray-300 rounded-xl p-4">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-sm font-medium text-gray-700">Selected Image:</span>
                     <button
                       type="button"
                       onClick={() => {
                         setImagePreview(null)
                         setFormData(prev => ({ ...prev, image: null }))
                         document.getElementById('image-upload').value = ''
                       }}
                       className="text-red-500 hover:text-red-700 text-sm"
                     >
                       Remove
                     </button>
                   </div>
                   <img 
                     src={imagePreview} 
                     alt="College preview" 
                     className="w-full h-48 object-cover rounded-lg"
                   />
                 </div>
               ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <FiCamera className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop an image or click to upload
                    </p>
                  </div>
                </label>
              </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full college address"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the college"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <input
                  type="text"
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  placeholder="e.g., $10,000 - $20,000/year"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={streamInput}
                      onChange={(e) => setStreamInput(e.target.value)}
                      onKeyPress={handleStreamKeyPress}
                      placeholder="Type stream name and press Enter (e.g., Computer Science, Commerce, etc.)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={addStream}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {streams.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {streams.map((stream, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                        >
                          {stream}
                          <button
                            type="button"
                            onClick={() => removeStream(stream)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Course Offerings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">📚</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Course Offerings</h2>
            </div>
            
            {courses.map((course, courseIndex) => (
              <div key={course.id} className="border border-gray-200 rounded-xl p-6 mb-6 relative">
                <button
                  type="button"
                  onClick={() => removeCourse(course.id)}
                  className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                
                <h3 className="text-lg font-medium text-gray-900 mb-4">Course {courseIndex + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                  </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Category
                     </label>
                     <select
                       value={course.category}
                       onChange={(e) => updateCourseCategory(course.id, e.target.value)}
                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                     >
                       <option value="">Select Category</option>
                       <option value="UG">Undergraduate</option>
                       <option value="PG">Postgraduate</option>
                       <option value="Engineering">Engineering</option>
                     </select>
                   </div>
                 </div>

                 <div className="mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Course
                    </label>
                    <textarea
                      value={course.description}
                      onChange={(e) => updateCourse(course.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Semester-wise Fees
                    {course.category && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({course.category === 'UG' ? '6' : course.category === 'PG' ? '4' : '8'} semesters)
                      </span>
                    )}
                  </h4>
                  
                  <div className="space-y-3">
                    {course.category === 'UG' && (
                      <>
                        {[1, 2, 3, 4, 5, 6].map((sem) => (
                          <div key={sem} className="flex items-center gap-4">
                            <div className="w-32 px-4 py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-700">
                              Semester {sem}
                            </div>
                            <input
                               type="text"
                              value={course.fees[sem - 1]?.amount || ''}
                              onChange={(e) => updateSemesterFee(course.id, sem - 1, 'amount', e.target.value)}
                              placeholder="Enter fee amount"
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            />
                          </div>
                        ))}
                      </>
                    )}
                    
                    {course.category === 'PG' && (
                      <>
                        {[1, 2, 3, 4].map((sem) => (
                          <div key={sem} className="flex items-center gap-4">
                            <div className="w-32 px-4 py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-700">
                              Semester {sem}
                            </div>
                        <input
                          type="text"
                              value={course.fees[sem - 1]?.amount || ''}
                              onChange={(e) => updateSemesterFee(course.id, sem - 1, 'amount', e.target.value)}
                              placeholder="Enter fee amount"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                          </div>
                        ))}
                      </>
                    )}
                    
                     {course.category === 'Engineering' && (
                      <>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <div key={sem} className="flex items-center gap-4">
                            <div className="w-32 px-4 py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-700">
                              Semester {sem}
                            </div>
                        <input
                          type="text"
                              value={course.fees[sem - 1]?.amount || ''}
                              onChange={(e) => updateSemesterFee(course.id, sem - 1, 'amount', e.target.value)}
                              placeholder="Enter fee amount"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                      </div>
                    ))}
                      </>
                    )}
                    
                     {!course.category && (
                      <div className="text-center py-8 text-gray-500">
                        Please select a category to see semester fee fields
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addCourse}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Another Course
            </button>
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/colleges')}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving College...' : 'Save College'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AddCollege
