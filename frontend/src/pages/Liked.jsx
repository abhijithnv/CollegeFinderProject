import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash } from 'react-icons/fi'
import { getLikedColleges, toggleCollegeLike } from '../api/Addcollege'
import { API_CONFIG } from '../api/config'

 const Liked = () => {
   const navigate = useNavigate()
   const [likedColleges, setLikedColleges] = useState([])
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState(null)


  // Fetch liked colleges from API
  const fetchLikedColleges = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) {
        setError('Please log in to view liked colleges')
        return
      }
      
      const user = JSON.parse(userData)
      const userId = user.id || user.user_id || user.userId || 1
      
      // Fetch liked colleges from API
      const data = await getLikedColleges(userId)
      setLikedColleges(data.liked_colleges || [])
      console.log('Liked colleges loaded:', data)
    } catch (e) {
      console.error('Error fetching liked colleges:', e)
      setError('Failed to load liked colleges. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLikedColleges()
  }, [])

  const removeFromLiked = async (college) => {
    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) {
        alert('Please log in to manage liked colleges')
        return
      }
      
      const user = JSON.parse(userData)
      const userId = user.id || user.user_id || user.userId || 1
      
      // Call API to unlike the college
      const response = await toggleCollegeLike(college.id, userId)
      
      // Update local state
      setLikedColleges(prev => prev.filter(c => c.id !== college.id))
      
      console.log('College removed from liked:', response.message)
    } catch (error) {
      console.error('Error removing from liked:', error)
      alert(`Failed to remove from liked: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-grey-light">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-10">
       <div className="flex items-center justify-between mb-6">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-grey-dark hover:text-grey-text transition-colors">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
           <span className="text-sm font-medium">Back</span>
         </button>
         <h1 className="w-full text-center uppercase text-xl sm:text-xl font-bold text-orange-300">Liked Colleges</h1>
         <span className="w-16" />
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border shadow-sm p-4 animate-pulse" style={{ borderColor: '#e6e9ef' }}>
                <div className="h-40 w-full rounded-lg mb-3" style={{ backgroundColor: '#f3f4f6' }} />
                <div className="h-4 w-2/3 mb-2 rounded" style={{ backgroundColor: '#f3f4f6' }} />
                <div className="h-3 w-1/2 rounded" style={{ backgroundColor: '#f3f4f6' }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-white rounded-xl border shadow-sm p-4 mb-6 text-sm" style={{ borderColor: '#e6e9ef', color: '#b91c1c', backgroundColor: '#fff1f2' }}>
            {error}
          </div>
        )}

        {!loading && !error && likedColleges.length === 0 ? (
          <div className="bg-white rounded-xl border shadow-sm p-8 text-center" style={{ borderColor: '#e6e9ef' }}>
            <div className="text-grey-dark font-semibold mb-1">No liked colleges yet</div>
            <p className="text-sm text-grey-text">Browse colleges and tap the heart to save them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {likedColleges.map((c, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/college/${c.id ?? idx}`)}
                className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                style={{ borderColor: '#e6e9ef' }}
              >
                 <div className="h-40 w-full overflow-hidden relative">
                   <img 
                     src={`${API_CONFIG.BASE_URL}/college/${c.id}/image`} 
                     alt={c.college_name } 
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=60';
                     }}
                   />
                   <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
                 </div>
                 <div className="p-4">
                   <div className="flex items-start justify-between gap-3">
                     <div>
                       <div className="font-bold text-grey-dark">{c.college_name || c.name}</div>
                       <div className="text-sm text-grey-text mt-1">{c.address || c.location}</div>
                     </div>
                     <div className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(245,167,66,0.12)', color: '#8a4b00' }}>Liked</div>
                   </div>
                  {(c.price_range || c.feeRange) && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm font-semibold" style={{ color: '#16a34a' }}>
                        ₹{c.price_range || c.feeRange}
                      </div>
                      <button
                        aria-label="remove from liked"
                        className="p-2 rounded-md border hover:bg-red-50 text-red-600"
                        style={{ borderColor: '#fecaca' }}
                        onClick={(e) => { e.stopPropagation(); removeFromLiked(c) }}
                      >
                        <FiTrash size={14} />
                      </button>
                    </div>
                  )}
                 </div>
               </div>
            ))}
          </div>
        )}
      </main>

    </div>
  )
}

export default Liked


