import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { FiSearch, FiChevronDown, FiMapPin, FiHeart, FiLink, FiLogOut } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { getColleges, toggleCollegeLike, getLikedColleges } from '../api/Addcollege.js'
import { API_CONFIG } from '../api/config'

const FilterChip = ({ icon, label }) => (
  <button
    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
    style={{ borderColor: '#e6e9ef' }}
  >
    <span className="text-grey-dark">{icon}</span>
    <span className="text-grey-dark font-medium">{label}</span>
    <FiChevronDown className="text-grey-text" size={16} />
  </button>
)

const CollegeCard = ({ college, onOpen, liked, onToggleLike }) => (
  <div onClick={onOpen} className={`group bg-white/90 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-transform duration-200 cursor-pointer ${liked ? 'ring-2 ring-red-200' : ''}`} style={{ borderColor: liked ? '#fecaca' : '#e9edf3', transform: 'translateY(0)' }}>
    <div className="p-4 sm:p-5">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 sm:col-span-4">
          <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: '#eef2f7' }}>
            <img src={college.image} alt={college.name} className="w-full h-36 sm:h-40 object-cover transition-transform group-hover:scale-[1.01]" />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-grey-dark">{college.name}</h3>
              <div className="mt-2 flex items-center gap-2 text-grey-text text-sm">
                <FiMapPin size={16} />
                <span>{college.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  onToggleLike?.(college); 
                }}
                aria-pressed={liked}
                className={`p-2 rounded-full border transition-all duration-200 z-10 relative ${
                  liked 
                    ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300' 
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                aria-label={liked ? 'unlike' : 'like'}
              >
                {liked ? (
                  <FaHeart className="text-red-500 transition-colors duration-200" />
                ) : (
                  <FiHeart className="text-gray-500 hover:text-red-500 transition-colors duration-200" />
                )}
              </button>
            </div>
          </div>
          <div className="mt-3 text-emerald-600 font-bold flex items-center gap-1">
            <span className="text-xl">₹</span>
            {college.feeRange}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {college.tags.map((t, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs bg-grey-light text-grey-dark border" style={{ borderColor: '#e6e9ef' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const CollegeListing = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [selectedStreams, setSelectedStreams] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([]) 
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const avatarRef = useRef(null)
  const popoverRef = useRef(null)

  const [user, setUser] = useState({ name: 'S', email: 'user@gmail.com' })
  const [colleges, setColleges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser({
          name: parsedUser.username || 'User',
          email: parsedUser.email || 'user@gmail.com'
        })
        console.log('User data loaded:', parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  // Fetch colleges from API
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setIsLoading(true)
        const data = await getColleges()
        setColleges(data)
        console.log('Colleges loaded:', data)
      } catch (error) {
        console.error('Error fetching colleges:', error)
        setError('Failed to load colleges. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchColleges()
  }, [])

  // Fetch user's liked colleges to set initial like status
  useEffect(() => {
    const fetchLikedColleges = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) return
        
        const user = JSON.parse(userData)
        const userId = user.id || user.user_id || user.userId || 1
        
        const likedData = await getLikedColleges(userId)
        const likedCollegeIds = new Set(likedData.liked_colleges?.map(college => college.id) || [])
        setLikedKeys(likedCollegeIds)
        console.log('Initial liked colleges loaded:', Array.from(likedCollegeIds))
      } catch (error) {
        console.error('Error fetching liked colleges:', error)
        // Don't show error to user, just log it
      }
    }

    fetchLikedColleges()
  }, [])

  // like state managed by API
  const keyOf = (c) => c.id
  const [likedKeys, setLikedKeys] = useState(new Set())

  const toggleLike = async (college) => {
    try {
      console.log('🎯 Toggling like for college:', college.id, college.name)
      
      // Get user ID from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) {
        alert('Please log in to like colleges')
        return
      }
      
      const user = JSON.parse(userData)
      const userId = user.id || user.user_id || user.userId || 1
      
      // Call API to toggle like for this specific college
      const response = await toggleCollegeLike(college.id, userId)
      console.log('📡 API response for college', college.id, ':', response)
      
      // Update local state based on API response - only for this specific college
    setLikedKeys((prev) => {
      const next = new Set(prev)
        const collegeId = college.id
        console.log('🔄 Current liked keys before update:', Array.from(prev))
        console.log('🎯 Updating college ID:', collegeId, 'to liked:', response.liked)
        
        if (response.liked) {
          next.add(collegeId)
          console.log('✅ Added college', collegeId, 'to liked set')
      } else {
          next.delete(collegeId)
          console.log('❌ Removed college', collegeId, 'from liked set')
      }
        
        console.log('📊 New liked keys after update:', Array.from(next))
      return next
    })
      
      console.log('✅ Like toggled successfully for college', college.id, ':', response.message)
    } catch (error) {
      console.error('❌ Error toggling like for college', college.id, ':', error)
      alert(`Failed to update like status: ${error.message}`)
    }
  }

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!isAvatarOpen) return
      if (avatarRef.current && avatarRef.current.contains(e.target)) return
      if (popoverRef.current && popoverRef.current.contains(e.target)) return
      setIsAvatarOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [isAvatarOpen])

  // Logout function
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? You will be redirected to the sign-in page.')) {
      // Clear all user-related data
      localStorage.removeItem('user')
      localStorage.removeItem('likedColleges')
      setUser({ name: 'S', email: 'user@gmail.com' })
      setIsAvatarOpen(false)
      
      // Navigate to sign-in page with replace to prevent back navigation
      navigate('/signin', { replace: true })
      console.log('User logged out and redirected to sign-in page')
    }
  }

  const budgetPresets = [
    { label: 'Under ₹1 Lakh', min: 0, max: 100000 },
    { label: '₹1 Lakh - ₹2 Lakh', min: 100000, max: 200000 },
    { label: '₹2 Lakh - ₹5 Lakh', min: 200000, max: 500000 },
    { label: 'Over ₹5 Lakhs', min: 500000, max: Infinity },
  ]

  const streamPresets = [
    'Computer Science',
    'Data Science',
    'Business',
    'Finance',
    'Marketing',
  ]

  const categoryPresets = ['UG', 'PG', 'Engineering']

  // Transform API data to component format
  const transformedColleges = useMemo(() => {
    return colleges.map(college => ({
      id: college.id,
      name: college.college_name,
      location: college.address,
      feeRange: college.price_range || 'Contact for fees',
      image: `${API_CONFIG.BASE_URL}/college/${college.id}/image`,
      tags: [college.stream, college.course_name].filter(Boolean),
      categories: [college.category].filter(Boolean),
      about: college.about,
      course_about: college.course_about,
      stream: college.stream,
      course_name: college.course_name,
      category: college.category
    }))
  }, [colleges])

  // Helper function to parse fee range from price_range string
  const parseFeeRange = (feeRange) => {
    if (!feeRange || feeRange === 'Contact for fees') {
      return { min: 0, max: 0, hasValidRange: false }
    }
    
    // Remove currency symbols and clean the string
    const cleanRange = feeRange.replace(/[₹$,\s]/g, '').trim()
    
    // Handle ranges like "50000-100000"
    if (cleanRange.includes('-')) {
      const parts = cleanRange.split('-')
      if (parts.length === 2) {
        const min = parseInt(parts[0].trim())
        const max = parseInt(parts[1].trim())
        return { 
          min: isNaN(min) ? 0 : min, 
          max: isNaN(max) ? 0 : max,
          hasValidRange: !isNaN(min) && !isNaN(max) && min > 0 && max > 0
        }
      }
    }
    
    // Handle single values
    const singleValue = parseInt(cleanRange)
    return { 
      min: isNaN(singleValue) ? 0 : singleValue, 
      max: isNaN(singleValue) ? 0 : singleValue,
      hasValidRange: !isNaN(singleValue) && singleValue > 0
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const lq = locationQuery.trim().toLowerCase()
    return transformedColleges.filter(c => {
      const matchesText = q ? (c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)) : true
      const matchesLocation = lq ? c.location.toLowerCase().includes(lq) : true
      
      // Use feeRange for budget filtering
      const matchesBudget = selectedBudget
        ? (() => {
            const collegeFeeRange = parseFeeRange(c.feeRange)
            
            // Skip colleges with no valid fee information
            if (!collegeFeeRange.hasValidRange) return false
            
            const budgetMin = selectedBudget.min
            const budgetMax = selectedBudget.max === Infinity ? Number.MAX_SAFE_INTEGER : selectedBudget.max
            
            const collegeMin = collegeFeeRange.min
            const collegeMax = collegeFeeRange.max
            
            // Better logic: College is included if ANY part of its fee range falls within the budget range
            // This covers all overlap scenarios:
            // 1. College starts within budget range: collegeMin >= budgetMin && collegeMin <= budgetMax
            // 2. College ends within budget range: collegeMax >= budgetMin && collegeMax <= budgetMax  
            // 3. College completely encompasses budget range: collegeMin <= budgetMin && collegeMax >= budgetMax
            // 4. College is completely within budget range: collegeMin >= budgetMin && collegeMax <= budgetMax
            
            const collegeStartsInRange = collegeMin >= budgetMin && collegeMin <= budgetMax
            const collegeEndsInRange = collegeMax >= budgetMin && collegeMax <= budgetMax
            const collegeEncompassesRange = collegeMin <= budgetMin && collegeMax >= budgetMax
            const collegeWithinRange = collegeMin >= budgetMin && collegeMax <= budgetMax
            
            return collegeStartsInRange || collegeEndsInRange || collegeEncompassesRange || collegeWithinRange
          })()
        : true
      
      const matchesStreams = selectedStreams.length > 0
        ? c.tags.some(t => selectedStreams.includes(t))
        : true
      const matchesCategories = selectedCategories.length > 0
        ? c.categories?.some(cat => selectedCategories.includes(cat))
        : true
      return matchesText && matchesLocation && matchesBudget && matchesStreams && matchesCategories
    })
  }, [transformedColleges, query, locationQuery, selectedBudget, selectedStreams, selectedCategories])

  return (
    <div className="min-h-screen bg-grey-light">
      {/* <Header /> */}

      <main className="w-full" style={{ minHeight: '100vh' }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start px-6 py-8" style={{ minHeight: '100vh' }}>
          {/* Left 1/3: filters (sticky) */}
          <aside className="md:col-span-3 order-1 md:order-1 md:sticky md:top-25 self-start">
            <section className="rounded-lg border-r shadow-sm p-3 bg-gradient-to-br from-white via-white to-grey-light/60" style={{ borderColor: '#e9edf3' }}>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-sm font-semibold text-grey-dark">Filters</h3>
                <button
                  onClick={() => { setSelectedBudget(null); setSelectedStreams([]); setSelectedCategories([]); setLocationQuery(''); setQuery('') }}
                  className="rounded-full border px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
                  style={{ backgroundColor: '#f5a742', borderColor: '#f5a742' }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#f78f05' }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#f5a742' }}
                >
                  Reset
                </button>
              </div>

              <div className="space-y-3">
                {/* Budget */}
                <div className="rounded border bg-white p-4" style={{ borderColor: '#e6e9ef' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wide text-grey-text font-semibold">Budget</span>
                    {selectedBudget && <span className="text-xs text-grey-dark">{selectedBudget.label}</span>}
                  </div>
                  <div className="space-y-3">
                    {budgetPresets.map((p, idx) => {
                      const active = selectedBudget && selectedBudget.label === p.label
                      return (
                        <label key={`${p.label}-${selectedBudget ? selectedBudget.label : 'none'}`} className="flex items-center gap-3 cursor-pointer py-1">
                          <div className="relative">
                            <input
                              type="radio"
                              name="budget"
                              checked={active}
                              onChange={() => setSelectedBudget(active ? null : p)}
                              className="sr-only"
                            />
                            <div 
                              className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${active ? 'bg-orange-500' : 'bg-white'}`}
                              style={{ 
                                borderColor: active ? 'white' : '#d1d5db'
                              }}
                            >
                              {active && (
                                <div className="w-1 h-1 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs ${active ? 'text-grey-dark font-semibold' : 'text-grey-dark'}`}>{p.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Stream */}
                <div className="rounded border bg-white p-4" style={{ borderColor: '#e6e9ef' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wide text-grey-text font-semibold">Stream</span>
                    {selectedStreams.length > 0 && <span className="text-xs text-grey-dark">{selectedStreams.length} selected</span>}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {streamPresets.map((s, idx) => {
                      const active = selectedStreams.includes(s)
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedStreams(prev => active ? prev.filter(x => x !== s) : [...prev, s])}
                          className={`px-4 py-2 rounded-full text-xs transition-all ${active ? 'text-white' : 'text-grey-dark hover:bg-grey-light/50'}`}
                          style={{ backgroundColor: active ? '#f5a742' : 'transparent', border: `1px solid ${active ? '#f5a742' : '#e6e9ef'}` }}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Category - Commented out */}
                {/* <div className="rounded border bg-white p-4" style={{ borderColor: '#e6e9ef' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wide text-grey-text font-semibold">Category</span>
                    {selectedCategories.length > 0 && <span className="text-xs text-grey-dark">{selectedCategories.join(', ')}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categoryPresets.map((c, idx) => {
                      const active = selectedCategories.includes(c)
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedCategories(prev => active ? prev.filter(x => x !== c) : [...prev, c])}
                          className={`px-4 py-2 rounded-full text-xs transition-all ${active ? 'text-white' : 'text-grey-dark hover:bg-grey-light/50'}`}
                          style={{ backgroundColor: active ? '#f5a742' : 'transparent', border: `1px solid ${active ? '#f5a742' : '#e6e9ef'}` }}
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div> */}
              </div>
            </section>
          </aside>

          {/* Right 2/3: search + cards */}
          <div className="md:col-span-9 order-2 md:order-2 flex flex-col" style={{ minHeight: '100vh' }}>
            <div className="sticky top-7 z-10 bg-grey-light mb-6 flex items-center justify-between gap-4 px-5 -mt-3">
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-full border shadow-sm" style={{ borderColor: '#e6e9ef', width: '500px' }}>
                <FiSearch className="text-grey-text" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search colleges..."
                  className="flex-1 outline-none text-grey-dark text-sm"
                />
              </div>
              <div className="relative">
                <button
                  ref={avatarRef}
                  onClick={() => setIsAvatarOpen((v) => !v)}
                  aria-haspopup="dialog"
                  aria-expanded={isAvatarOpen}
                  className={`w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm focus:outline-none transition transform hover:scale-105 hover:shadow-md cursor-pointer ${isAvatarOpen ? 'ring-2 ring-offset-2 ring-orange-400' : ''}`}
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
                >
                  {user.name?.[0]?.toUpperCase() || 'S'}
                </button>

                {isAvatarOpen && (
                  <div
                    ref={popoverRef}
                    role="dialog"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl border shadow-lg p-3"
                    style={{ borderColor: '#e6e9ef' }}
                  >
                  <div className="flex items-center gap-3 p-2">
                      <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm">{user.name?.[0]?.toUpperCase() || 'S'}</div>
                      <div>
                        <div className="text-sm font-semibold text-grey-dark">{user.name}</div>
                        <div className="text-xs text-grey-text">{user.email}</div>
                      </div>
                    </div>
                    <div className="h-px my-2" style={{ backgroundColor: '#eef2f7' }} />
                    <div className="flex flex-col">
                      <button onClick={() => { setIsAvatarOpen(false); navigate('/liked') }} className="group flex items-center gap-2 px-2 py-2 rounded-md hover:bg-grey-light active:bg-grey-light/90 transition text-sm text-grey-dark hover:text-orange-500">
                        <FiHeart className="text-grey-text group-hover:text-orange-500" /> Liked
                      </button>
                      <button onClick={() => { setIsAvatarOpen(false); navigate('/compare') }} className="group flex items-center gap-2 px-2 py-2 rounded-md hover:bg-grey-light active:bg-grey-light/90 transition text-sm text-grey-dark hover:text-orange-500">
                        <FiLink className="text-grey-text group-hover:text-orange-500" /> Compare
                      </button>
                      <button onClick={handleLogout} className="group flex items-center gap-2 px-2 py-2 rounded-md hover:bg-red-50 active:bg-red-50/90 transition text-sm text-red-600 hover:text-red-700">
                        <FiLogOut className="text-red-500 group-hover:text-red-600" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="pt-0 px-4 sticky"
              style={{
                top: '6rem',
                height: 'calc(100vh - 7rem - 1rem)',
                borderColor: '#e6e9ef'
              }}
            >
              <div className="h-full overflow-y-auto no-scrollbar">
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
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg font-medium mb-2">No Colleges Found</p>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
            <div className="grid gap-5">
                  {filtered.map((college, idx) => (
                    <CollegeCard
                    key={`college-${college.id}-${idx}`}
                      college={college}
                      liked={likedKeys.has(keyOf(college))}
                      onToggleLike={toggleLike}
                    onOpen={() => navigate(`/college/${college.id}`)}
                    />
                  ))}
                </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CollegeListing