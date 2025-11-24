import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        
        if (storedUser && storedToken) {
          try {
            const userData = JSON.parse(storedUser)
            // Validate user data structure
            if (userData && userData.userId && userData.role) {
              setUser(userData)
              api.defaults.headers.common['x-userid'] = userData.userId
            } else {
              // Invalid user data, clear it
              localStorage.removeItem('user')
              localStorage.removeItem('token')
            }
          } catch (error) {
            console.error('Error parsing user data:', error)
            localStorage.removeItem('user')
            localStorage.removeItem('token')
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  const login = async (role, userId) => {
    try {
      let endpoint = ''
      switch (role) {
        case 'patient':
          endpoint = '/auth/loginPatient'
          break
        case 'doctor':
          endpoint = '/auth/loginDoctor'
          break
        case 'insurance':
          endpoint = '/auth/loginInsuranceAgent'
          break
        case 'admin':
          // Admin login uses hospital admin endpoint
          endpoint = '/auth/loginPatient' // Using same endpoint structure
          break
        default:
          throw new Error('Invalid role')
      }

      const response = await api.post(endpoint, { userId })
      
      if (response.data.success) {
        const userData = {
          userId,
          role,
          ...response.data.data
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userId) // Using userId as token
        api.defaults.headers.common['x-userid'] = userId
        
        return { success: true, data: userData }
      }
      
      throw new Error(response.data.message || 'Login failed')
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    delete api.defaults.headers.common['x-userid']
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

