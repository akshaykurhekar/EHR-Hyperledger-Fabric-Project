import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationPanel from './NotificationPanel'
import { 
  FiHome, FiLogOut, FiUser, 
  FiShield, FiActivity, FiFileText, FiUsers,
  FiHeart, FiUserCheck, FiDollarSign, FiClipboard
} from 'react-icons/fi'

const Layout = ({ children, title, navItems = [] }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Debug logging
  React.useEffect(() => {
    console.log('Layout rendered', { user, hasUserId: !!user?.userId, title })
  }, [user, title])

  // Early return if user is not available
  if (!user || !user.userId) {
    console.warn('Layout: User not available', { user })
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <FiShield className="w-6 h-6" />
      case 'doctor':
        return <FiUserCheck className="w-6 h-6" />
      case 'insurance':
        return <FiDollarSign className="w-6 h-6" />
      case 'patient':
        return <FiHeart className="w-6 h-6" />
      default:
        return <FiUser className="w-6 h-6" />
    }
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-purple-500'
      case 'doctor':
        return 'bg-blue-500'
      case 'insurance':
        return 'bg-green-500'
      case 'patient':
        return 'bg-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className={`${getRoleColor()} text-white p-2 rounded-lg`}>
                {getRoleIcon()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500 capitalize">{user?.role} Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationPanel />
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.userId}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.path !== location.pathname) {
                    navigate(item.path)
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

