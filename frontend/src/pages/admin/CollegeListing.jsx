import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiPlus } from 'react-icons/fi'
import { getColleges, deleteCollege } from '../../api/Addcollege'
import { API_CONFIG } from '../../api/config'

const AdminCollegeListing = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [colleges, setColleges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Fetch colleges from API
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setIsLoading(true)
        const data = await getColleges()
        setColleges(data)
        console.log('Admin colleges loaded:', data)
      } catch (error) {
        console.error('Error fetching colleges:', error)
        setError('Failed to load colleges. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchColleges()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this college?')) {
      try {
        setDeletingId(id)
        await deleteCollege(id)
        // Remove the college from the local state
        setColleges(prevColleges => prevColleges.filter(college => college.id !== id))
        console.log('College deleted successfully')
      } catch (error) {
        console.error('Error deleting college:', error)
        alert('Failed to delete college. Please try again.')
      } finally {
        setDeletingId(null)
      }
    }
  }

  // Transform API data to component format
  const transformedColleges = colleges.map(college => ({
    id: college.id,
    name: college.college_name,
    location: college.address,
    image: `${API_CONFIG.BASE_URL}/college/${college.id}/image`,
    type: college.category || 'Unknown',
    status: 'Open for Admissions'
  }))

  const filteredColleges = transformedColleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">College Listings</h1>
            <p className="text-gray-600 text-lg">Manage and view all colleges in your system</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search colleges..."
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link
              to="/admin/colleges/add"
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <FiPlus className="mr-2 w-5 h-5" />
              Add New College
            </Link>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading colleges...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading Colleges</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredColleges.map((college) => (
          <div key={college.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="relative overflow-hidden">
              <img 
                src={college.image} 
                alt={college.name} 
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{college.name}</h3>
              <div className="flex items-center text-gray-600 mb-4">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">{college.location}</span>
              </div>
              
              {college.status && (
                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {college.status}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => handleDelete(college.id)}
                disabled={deletingId === college.id}
                className={`w-full px-4 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl ${
                  deletingId === college.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                {deletingId === college.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete College'
                )}
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {!isLoading && !error && filteredColleges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No colleges found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first college.'}
          </p>
          {!searchTerm && (
            <Link
              to="/admin/colleges/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add New College
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminCollegeListing
