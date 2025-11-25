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

  const login = async (role, email, password) => {
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
          // Admin login uses patient endpoint for now
          endpoint = '/auth/loginPatient'
          break
        default:
          throw new Error('Invalid role')
      }

      const response = await api.post(endpoint, { email, password })
      
      // Handle needsRegistration response
      if (response.data.data?.needsRegistration) {
        return {
          success: false,
          needsRegistration: true,
          message: response.data.data.message || 'Please register first'
        }
      }

      // Handle needsChaincodeRegistration response
      if (response.data.data?.needsChaincodeRegistration) {
        const userData = {
          userId: response.data.data.userId,
          role,
          name: response.data.data.name,
          registeredOnChain: false,
          ...response.data.data
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userData.userId)
        api.defaults.headers.common['x-userid'] = userData.userId
        
        return {
          success: true,
          needsChaincodeRegistration: true,
          userId: userData.userId,
          message: response.data.data.message || 'Registration pending admin approval'
        }
      }

      // Successful login
      if (response.data.success && response.data.data) {
        const userData = {
          userId: response.data.data.userId,
          role,
          name: response.data.data.name,
          registeredOnChain: response.data.data.registeredOnChain || false,
          ...response.data.data
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userData.userId)
        api.defaults.headers.common['x-userid'] = userData.userId
        
        return { 
          success: true, 
          data: userData 
        }
      }
      
      throw new Error(response.data.message || 'Login failed')
    } catch (error) {
      // Handle network errors and API errors
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      return {
        success: false,
        message: errorMessage
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
