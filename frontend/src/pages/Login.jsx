import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { FiShield, FiUserCheck, FiDollarSign, FiHeart, FiLogIn, FiMail, FiLock } from 'react-icons/fi'

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const roles = [
    { value: 'patient', label: 'Patient', icon: <FiHeart className="w-6 h-6" />, color: 'bg-pink-500' },
    { value: 'doctor', label: 'Doctor', icon: <FiUserCheck className="w-6 h-6" />, color: 'bg-blue-500' },
    { value: 'insurance', label: 'Insurance Agent', icon: <FiDollarSign className="w-6 h-6" />, color: 'bg-green-500' },
    { value: 'admin', label: 'Admin', icon: <FiShield className="w-6 h-6" />, color: 'bg-purple-500' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password')
      return
    }

    setLoading(true)
    try {
      const result = await login(selectedRole, email.trim(), password)
      setLoading(false)

      if (result.success) {
        if (result.needsRegistration) {
          // User needs to register - redirect to registration
          toast.info('Please register first')
          navigate('/register', { state: { role: selectedRole, email: email.trim() } })
        } else if (result.needsChaincodeRegistration) {
          // User registered but needs admin to complete blockchain registration
          toast.warning(result.message || 'Your registration is pending. Please wait for admin approval.')
          // Still allow login but show warning
          if (result.userId) {
            navigate(`/${selectedRole}/dashboard`)
          }
        } else {
          // Successful login
          toast.success(`Welcome back!`)
          navigate(`/${selectedRole}/dashboard`)
        }
      } else {
        toast.error(result.message || 'Login failed. Please check your credentials.')
      }
    } catch (error) {
      setLoading(false)
      toast.error(error.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl mb-4">
              <FiShield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EHR CareCrypt</h1>
            <p className="text-gray-600">Secure Healthcare Management</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === role.value
                      ? `${role.color} text-white border-transparent shadow-lg transform scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {role.icon}
                    <span className="text-sm font-medium">{role.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiLogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
