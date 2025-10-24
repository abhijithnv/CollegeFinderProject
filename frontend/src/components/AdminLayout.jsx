import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  FiGrid, 
  FiBook, 
  FiBookOpen, 
  FiUser, 
  FiSettings, 
  FiBarChart,
  FiMenu,
  FiX,
  FiPlusCircle,
  FiLogOut
} from 'react-icons/fi'

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Check admin authentication on component mount
  useEffect(() => {
    const checkAdminAuth = () => {
      const userData = localStorage.getItem('user')
      if (!userData) {
        console.log('No user data found, redirecting to sign-in')
        navigate('/signin', { replace: true })
        return
      }
      
      try {
        const user = JSON.parse(userData)
        if (!user || user.role !== 'admin') {
          console.log('User is not admin, redirecting to sign-in')
          alert('Access denied. Admin privileges required.')
          navigate('/signin', { replace: true })
          return
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        navigate('/signin', { replace: true })
        return
      }
    }

    checkAdminAuth()
  }, [navigate])

  // Logout function with confirmation
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? You will be redirected to the sign-in page.')) {
      // Clear user data
      localStorage.removeItem('user')
      navigate('/signin', { replace: true })
      console.log('Admin logged out and redirected to sign-in page')
    }
  }

  const menuItems = [
    { path: '/admin/colleges', icon: FiBookOpen, label: 'View Colleges' },
    { path: '/admin/colleges/add', icon: FiPlusCircle, label: 'Add College' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="bg-blue-600 h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-blue-600 font-bold text-lg">★</span>
            </div>
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-2 rounded-md hover:bg-blue-700 text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl mb-3 transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="font-semibold text-lg">{item.label}</span>
              </Link>
            )
          })}
        </nav>

      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiMenu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={handleLogout}
              className="p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
              title="Logout"
            >
              <FiLogOut className="w-6 h-6 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
