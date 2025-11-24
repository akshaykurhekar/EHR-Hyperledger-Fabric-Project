import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { submitRegistrationRequest } from '../services/registrationService'
import { FiShield, FiUserCheck, FiDollarSign, FiHeart, FiUserPlus } from 'react-icons/fi'

const Register = () => {
  const [selectedRole, setSelectedRole] = useState('patient')
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const roles = [
    { value: 'patient', label: 'Patient', icon: <FiHeart className="w-6 h-6" />, color: 'bg-pink-500' },
    { value: 'doctor', label: 'Doctor', icon: <FiUserCheck className="w-6 h-6" />, color: 'bg-blue-500' },
    { value: 'hospital', label: 'Hospital Admin', icon: <FiShield className="w-6 h-6" />, color: 'bg-purple-500' },
    { value: 'insurance', label: 'Insurance Admin', icon: <FiDollarSign className="w-6 h-6" />, color: 'bg-green-500' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await submitRegistrationRequest(selectedRole, formData)
      
      if (result.success) {
        toast.success('Registration request submitted! Admin will review and approve your account.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit registration request')
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
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
              <input
                type="text"
                value={formData.userId || ''}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                placeholder="patient01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor ID</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor ID *</label>
              <input
                type="text"
                value={formData.doctorId || ''}
                onChange={(e) => handleInputChange('doctorId', e.target.value)}
                placeholder="doctor01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
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
      
      case 'hospital':
        return (
          <>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
              <input
                type="text"
                value={formData.userId || ''}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                placeholder="Hospital01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="City General Hospital"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main St, City, State"
                rows="3"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
              <input
                type="text"
                value={formData.userId || ''}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                placeholder="Insurance01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Health Insurance Co"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="456 Insurance Ave, City, State"
                rows="3"
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
            <p className="text-gray-600">Submit a registration request for admin approval</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
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
                  <span>Submit Registration Request</span>
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

