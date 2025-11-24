import React, { useState, useEffect } from 'react'
import { FiBell, FiX, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const NotificationPanel = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (user) {
      loadNotifications()
      // Poll for new notifications every 5 seconds
      const interval = setInterval(loadNotifications, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = () => {
    if (!user) return
    const stored = JSON.parse(localStorage.getItem(`notifications_${user.userId}`) || '[]')
    setNotifications(stored.filter(n => !n.read).reverse())
  }

  const markAsRead = (notificationId) => {
    if (!user) return
    const stored = JSON.parse(localStorage.getItem(`notifications_${user.userId}`) || '[]')
    const updated = stored.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    localStorage.setItem(`notifications_${user.userId}`, JSON.stringify(updated))
    loadNotifications()
  }

  const markAllAsRead = () => {
    if (!user) return
    const stored = JSON.parse(localStorage.getItem(`notifications_${user.userId}`) || '[]')
    const updated = stored.map(n => ({ ...n, read: true }))
    localStorage.setItem(`notifications_${user.userId}`, JSON.stringify(updated))
    loadNotifications()
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approved':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <FiXCircle className="w-5 h-5 text-red-500" />
      default:
        return <FiInfo className="w-5 h-5 text-blue-500" />
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <FiBell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiBell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.action || notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{notification.message || 'New notification'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationPanel

