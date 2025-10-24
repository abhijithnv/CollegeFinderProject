import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { FiArrowLeft, FiMapPin, FiDollarSign, FiTrendingUp, FiStar, FiBookOpen, FiHome, FiX } from 'react-icons/fi'
import { getCompareList, removeFromCompare } from '../api/Addcollege'
import { API_CONFIG } from '../api/config'

const Compare = () => {
  const navigate = useNavigate()
  const [selectedColleges, setSelectedColleges] = useState([null, null])
  const [availableColleges, setAvailableColleges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Function to remove a college from comparison
  const removeCollege = async (collegeId) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to remove this college from comparison?')) {
      return
    }
    
    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) {
        alert('Please log in to manage compared colleges')
        return
      }
      
      const user = JSON.parse(userData)
      const userId = user.id || user.user_id || user.userId || 1
      
      console.log('Removing college from compare:', { userId, collegeId })
      
      // Call API to remove college from compare list
      const response = await removeFromCompare(userId, collegeId)
      
      // Update local state
      setSelectedColleges(prev => prev.filter(college => college && college.id !== collegeId))
      setAvailableColleges(prev => prev.filter(college => college.id !== collegeId))
      
      console.log('College removed from compare successfully:', response.message)
      
      // Show success message
      alert('College removed from comparison successfully!')
    } catch (error) {
      console.error('Error removing from compare:', error)
      alert(`Failed to remove from comparison: ${error.message}`)
    }
  }

  // Fetch compared colleges from API
  useEffect(() => {
    const fetchComparedColleges = async () => {
      try {
        setIsLoading(true)
        
        // Get user ID from localStorage
        const userData = localStorage.getItem('user')
        if (!userData) {
          setError('Please log in to view compared colleges')
          return
        }
        
        const user = JSON.parse(userData)
        const userId = user.id || user.user_id || user.userId || 1
        
        // Fetch compared colleges from API
        const data = await getCompareList(userId)
        const comparedColleges = data.compared_colleges || []
        
        // Transform API data to component format
        const transformedColleges = comparedColleges.map(college => ({
          id: college.id,
          name: college.college_name,
          location: college.address,
          image: `${API_CONFIG.BASE_URL}/college/${college.id}/image`,
          feeRange: college.price_range || 'Contact for fees',
          about: college.about,
          stream: college.stream,
          courses: college.courses || [],
          tags: [college.stream].filter(Boolean),
          rating: 4.5, // Default rating since not in API
          students: 1000, // Default value
          established: 2000, // Default value
          placement: 85, // Default value
          avgPackage: college.price_range || 'Contact for details',
          topRecruiters: ['Company A', 'Company B'], // Default value
          description: college.about
        }))
        
        setAvailableColleges(transformedColleges)
        
        // Set first two colleges for comparison if available
        if (transformedColleges.length >= 2) {
          setSelectedColleges([transformedColleges[0], transformedColleges[1]])
        } else if (transformedColleges.length === 1) {
          setSelectedColleges([transformedColleges[0], null])
        }
        
        console.log('Compared colleges loaded:', transformedColleges)
      } catch (error) {
        console.error('Error fetching compared colleges:', error)
        setError('Failed to load compared colleges. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComparedColleges()
  }, [])

  // Sample college data (same as used in other pages)
  const sampleColleges = [
    {
      id: 0,
      name: "MIT - Massachusetts Institute of Technology",
      location: "Cambridge, MA",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
      feeRange: "$53,450 - $55,510",
      tags: ["Engineering", "Computer Science", "Research"],
      rating: 4.9,
      students: 11520,
      established: 1861,
      courses: ["Computer Science", "Engineering", "Physics", "Mathematics"],
      placement: 95,
      avgPackage: "$120,000",
      topRecruiters: ["Google", "Microsoft", "Apple", "Amazon"],
      description: "A world-renowned institution for science, technology, and engineering education."
    },
    {
      id: 1,
      name: "Stanford University",
      location: "Stanford, CA",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
      feeRange: "$56,169 - $58,416",
      tags: ["Business", "Computer Science", "Medicine"],
      rating: 4.8,
      students: 17398,
      established: 1885,
      courses: ["Computer Science", "Business", "Medicine", "Law"],
      courseDetails: [
        {
          id: 1,
          title: "B.S. Computer Science",
          fees: [
            { semester: "Semester 1", amount: "$9,600" },
            { semester: "Semester 2", amount: "$9,400" },
            { semester: "Semester 3", amount: "$9,800" }
          ]
        },
        {
          id: 2,
          title: "B.S. Management Science & Engineering",
          fees: [
            { semester: "Semester 1", amount: "$9,200" },
            { semester: "Semester 2", amount: "$9,150" },
            { semester: "Semester 3", amount: "$9,350" }
          ]
        },
        {
          id: 3,
          title: "MBA (Graduate School of Business)",
          fees: [
            { semester: "Semester 1", amount: "$12,500" },
            { semester: "Semester 2", amount: "$12,300" },
            { semester: "Semester 3", amount: "$12,700" }
          ]
        }
      ],
      placement: 92,
      avgPackage: "$115,000",
      topRecruiters: ["Google", "Facebook", "Tesla", "Netflix"],
      description: "Ivy League institution known for academic excellence and research in law and medicine and arts and sciences and business and engineering. Also known for its strong liberal arts program. It is a research university and is known for its strong liberal arts program"
    },
    {
      id: 2,
      name: "Harvard University",
      location: "Cambridge, MA",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
      feeRange: "$54,269 - $56,170",
      tags: ["Law", "Medicine", "Business"],
      rating: 4.9,
      students: 23195,
      established: 1636,
      courses: ["Law", "Medicine", "Business", "Arts"],
      courseDetails: [
        {
          id: 1,
          title: "A.B. Economics",
          fees: [
            { semester: "Semester 1", amount: "$8,800" },
            { semester: "Semester 2", amount: "$8,600" },
            { semester: "Semester 3", amount: "$8,950" }
          ]
        },
        {
          id: 2,
          title: "B.A. Computer Science",
          fees: [
            { semester: "Semester 1", amount: "$9,100" },
            { semester: "Semester 2", amount: "$8,900" },
            { semester: "Semester 3", amount: "$9,200" }
          ]
        },
        {
          id: 3,
          title: "MBA (Harvard Business School)",
          fees: [
            { semester: "Semester 1", amount: "$12,200" },
            { semester: "Semester 2", amount: "$12,000" },
            { semester: "Semester 3", amount: "$12,500" }
          ]
        }
      ],
      placement: 90,
      avgPackage: "$110,000",
      topRecruiters: ["McKinsey", "Goldman Sachs", "Google", "Microsoft"],
      description: "Premier public research university with strong engineering programs and business programs and liberal arts programs and sciences programs. It is a research university and is known for its strong liberal arts program. It is a public university and is known for its strong engineering programs and business programs and liberal arts programs and sciences programs."
    },
  ]

  useEffect(() => {
    setAvailableColleges(sampleColleges)
    // Default to Harvard (left) and Stanford (right) like the mock
    const harvard = sampleColleges.find(c => c.name.includes('Harvard'))
    const stanford = sampleColleges.find(c => c.name.includes('Stanford'))
    setSelectedColleges([harvard || sampleColleges[0], stanford || sampleColleges[1]])
  }, [])
  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-grey-text">{label}</span>
      <span className="text-sm font-medium text-grey-dark">{value || '—'}</span>
    </div>
  )

  const Tag = ({ children, tone = 'grey' }) => (
    <span className={`${tone === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' : tone === 'orange' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-grey-light text-grey-dark'} text-xs px-2.5 py-1 rounded-full border`} style={{ borderColor: tone === 'blue' || tone === 'orange' ? undefined : '#e6e9ef' }}>
      {children}
    </span>
  )

  const computeGrade = (rating) => {
    if (rating >= 4.85) return 'A+'
    if (rating >= 4.5) return 'A'
    if (rating >= 4.0) return 'B+'
    return 'B'
  }

  const estimateSemesterFees = (feeRangeStr) => {
    if (!feeRangeStr) return []
    try {
      const nums = (feeRangeStr.match(/\$?[0-9,.]+/g) || []).map((s) => Number(s.replace(/[^0-9.]/g, '')))
      const base = nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) / 2) : 5000
      return [
        { semester: 'Semester 1', amount: `$${(base * 1.0).toLocaleString()}` },
        { semester: 'Semester 2', amount: `$${(base * 0.97).toLocaleString()}` },
        { semester: 'Semester 3', amount: `$${(base * 1.03).toLocaleString()}` }
      ]
    } catch (_) {
      return [
        { semester: 'Semester 1', amount: '$5,000' },
        { semester: 'Semester 2', amount: '$4,900' },
        { semester: 'Semester 3', amount: '$5,150' }
      ]
    }
  }

  const CollegeDetailCard = ({ college, onRemove }) => {
    const [expandedCourse, setExpandedCourse] = useState(null)
    
    // Process courses from API data
    const processCourses = (courses) => {
      if (!courses || !Array.isArray(courses)) return []
      
      return courses.slice(0, 3).map((course, idx) => ({
        id: course.id || idx + 1,
        title: course.course_name || course.title || `Course ${idx + 1}`,
        fees: [
          { semester: 'Semester 1', amount: `₹${course.sem1_fee || 0}` },
          { semester: 'Semester 2', amount: `₹${course.sem2_fee || 0}` },
          { semester: 'Semester 3', amount: `₹${course.sem3_fee || 0}` },
          { semester: 'Semester 4', amount: `₹${course.sem4_fee || 0}` },
          { semester: 'Semester 5', amount: `₹${course.sem5_fee || 0}` },
          { semester: 'Semester 6', amount: `₹${course.sem6_fee || 0}` },
          { semester: 'Semester 7', amount: `₹${course.sem7_fee || 0}` },
          { semester: 'Semester 8', amount: `₹${course.sem8_fee || 0}` }
        ].filter(fee => fee.amount !== '₹0' && fee.amount !== '₹null')
      }))
    }
    
    const coursesWithFees = processCourses(college.courses)

    return (
    <div className="bg-white rounded-2xl shadow-sm border p-7 relative" style={{ borderColor: '#e9edf3' }}>
      {/* Close button - functional */}
      {onRemove && (
        <button
          onClick={() => onRemove(college.id)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105"
          aria-label="Remove from comparison"
        >
          <FiX size={16} />
        </button>
      )}
      
      <div className="mb-5">
        <div className="rounded-xl overflow-hidden mb-5">
          <img 
            src={college.image} 
            alt={college.name} 
            className="w-full h-60 object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=60';
            }}
          />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-grey-dark">{college.name}</h3>
            <div className="flex items-center gap-2 text-grey-text text-xs mt-1">
              <FiMapPin size={14} />
              <span>{college.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">NAAC A++</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">Placement {college.placement}%</span>
          </div>
        </div>
      </div>

      {/* About */}
      <section className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs">•</span>
          <h4 className="font-semibold text-grey-dark">About</h4>
        </div>
        <p className="text-sm text-grey-text leading-relaxed">{college.description}</p>
      </section>

      {/* Streams */}
      <section className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">•</span>
          <h4 className="font-semibold text-grey-dark">Streams</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {(college.tags || []).slice(0, 6).map((t, i) => (
            <Tag key={i} tone="orange">{t}</Tag>
          ))}
        </div>
      </section>

      {/* Courses & Fees */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs">•</span>
          <h4 className="font-semibold text-grey-dark">Courses & Fees</h4>
        </div>
        <div className="space-y-3">
          {coursesWithFees.map((course) => (
            <div key={course.id} className="bg-white rounded-lg border shadow-sm" style={{ borderColor: '#e6e9ef' }}>
              <button
                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-grey-light/30 transition-colors"
              >
                <span className="font-medium text-sm text-grey-dark">{course.title}</span>
                <svg className="w-4 h-4 text-grey-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {expandedCourse === course.id ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              </button>
              {expandedCourse === course.id && (
                <div className="px-3 pb-3 border-t" style={{ borderColor: '#e6e9ef' }}>
                  <div className="bg-grey-light/50 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 gap-0 text-xs font-medium text-grey-dark bg-grey-light p-2">
                      <div>Semester</div>
                      <div className="text-right">Amount</div>
                    </div>
                    {course.fees.map((fee, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-0 text-sm p-2 border-t" style={{ borderColor: '#e6e9ef' }}>
                        <div className="text-grey-text">{fee.semester}</div>
                        <div className="text-right font-semibold text-grey-dark">{fee.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )}


  return (
    <div className="min-h-screen bg-grey-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-grey-dark hover:text-grey-text transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="w-full text-center uppercase text-xl sm:text-xl font-bold text-orange-300">Compare Colleges</h1>
          <span className="w-16" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading compared colleges...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 text-lg font-medium mb-2">Error Loading Compared Colleges</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
         ) : availableColleges.length === 0 ? (
           <div className="text-center py-12">
             <div className="text-gray-400 mb-4">
               <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
             </div>
             <p className="text-gray-600 text-lg font-medium mb-2">No Colleges to Compare</p>
             <p className="text-gray-500">Add colleges to your comparison list to see them here.</p>
           </div>
         ) : availableColleges.length === 1 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <CollegeDetailCard college={selectedColleges[0]} onRemove={removeCollege} />
             <div className="bg-white rounded-2xl shadow-sm border p-7 flex items-center justify-center" style={{ borderColor: '#e9edf3' }}>
               <div className="text-center">
                 <div className="text-gray-400 mb-4">
                   <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                 </div>
                 <p className="text-gray-600 text-lg font-medium mb-2">Add Another College</p>
                 <p className="text-gray-500 text-sm">Add one more college to start comparing.</p>
               </div>
             </div>
           </div>
         ) : availableColleges.length >= 2 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <CollegeDetailCard college={selectedColleges[0]} onRemove={removeCollege} />
             <CollegeDetailCard college={selectedColleges[1]} onRemove={removeCollege} />
           </div>
         ) : (
           <div className="text-center py-12">
             <p className="text-gray-600 text-lg font-medium mb-2">Add More Colleges to Compare</p>
             <p className="text-gray-500">You need at least 2 colleges to start comparing.</p>
           </div>
         )}
      </div>
    </div>
  )
}

export default Compare
