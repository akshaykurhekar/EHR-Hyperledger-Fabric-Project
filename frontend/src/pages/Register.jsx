import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'
import { FiShield, FiUserCheck, FiDollarSign, FiHeart, FiUserPlus, FiMail, FiLock } from 'react-icons/fi'

const Register = () => {
  const location = useLocation()
  const [selectedRole, setSelectedRole] = useState(location.state?.role || 'patient')
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const roles = [
    { value: 'patient', label: 'Patient', icon: <FiHeart className="w-6 h-6" />, color: 'bg-pink-500' },
    { value: 'doctor', label: 'Doctor', icon: <FiUserCheck className="w-6 h-6" />, color: 'bg-blue-500' },
    { value: 'insurance', label: 'Insurance Agent', icon: <FiDollarSign className="w-6 h-6" />, color: 'bg-green-500' }
  ]

  useEffect(() => {
    if (location.state?.role) {
      setSelectedRole(location.state.role)
    }
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate password
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      let endpoint = ''
      let payload = {}

      switch (selectedRole) {
        case 'patient':
          endpoint = '/auth/registerPatient'
          if (!email || !password || !formData.name || !formData.dob || !formData.city) {
            toast.error('Please fill in all required fields')
            setLoading(false)
            return
          }
          payload = {
            email,
            password,
            name: formData.name,
            dob: formData.dob,
            city: formData.city,
            doctorId: formData.doctorId || null
          }
          break

        case 'doctor':
          endpoint = '/auth/registerDoctor'
          if (!email || !password || !formData.name || !formData.hospitalId || !formData.city) {
            toast.error('Please fill in all required fields')
            setLoading(false)
            return
          }
          payload = {
            email,
            password,
            name: formData.name,
            hospitalId: formData.hospitalId,
            city: formData.city
          }
          break

        case 'insurance':
          endpoint = '/auth/registerInsuranceAgent'
          if (!email || !password || !formData.name || !formData.insuranceId || !formData.city) {
            toast.error('Please fill in all required fields')
            setLoading(false)
            return
          }
          payload = {
            email,
            password,
            name: formData.name,
            insuranceId: formData.insuranceId,
            city: formData.city
          }
          break

        default:
          toast.error('Invalid role selected')
          setLoading(false)
          return
      }

      const response = await api.post(endpoint, payload)

      if (response.data.success) {
        toast.success(response.data.data?.message || 'Registration successful! Your userId has been generated. An admin will complete your blockchain registration shortly.')
        
        // Show userId to user
        if (response.data.data?.userId) {
          toast.info(`Your User ID: ${response.data.data.userId}. Please save this for future reference.`)
        }

        setTimeout(() => {
          navigate('/login', { state: { email, role: selectedRole } })
        }, 3000)
      } else {
        toast.error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderFormFields = () => {
    switch (selectedRole) {
      case 'patient':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <input
                type="text"
                value={formData.dob || ''}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                placeholder="01/01/1990"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="New York"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor ID (Optional)</label>
              <input
                type="text"
                value={formData.doctorId || ''}
                onChange={(e) => handleInputChange('doctorId', e.target.value)}
                placeholder="doctor01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </>
        )

      case 'doctor':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Dr. Jane Smith"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital ID *</label>
              <input
                type="text"
                value={formData.hospitalId || ''}
                onChange={(e) => handleInputChange('hospitalId', e.target.value)}
                placeholder="Hospital01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="New York"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </>
        )

      case 'insurance':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Agent Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance ID *</label>
              <input
                type="text"
                value={formData.insuranceId || ''}
                onChange={(e) => handleInputChange('insuranceId', e.target.value)}
                placeholder="Insurance01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="New York"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl mb-4">
              <FiUserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Account</h1>
            <p className="text-gray-600">Create your account. A unique User ID will be generated for you.</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.value)
                    setFormData({})
                  }}
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {renderFormFields()}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiUserPlus className="w-5 h-5" />
                  <span>Register</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
