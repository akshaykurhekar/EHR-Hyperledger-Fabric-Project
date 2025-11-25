import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { 
  FiFileText, FiPlus, FiUser, FiHeart, FiShield,
  FiUpload, FiEdit, FiEye
} from 'react-icons/fi'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { notifyClaimSubmitted } from '../../services/notificationService'

const PatientDashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('claims')
  const [claims, setClaims] = useState([])
  const [records, setRecords] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimForm, setClaimForm] = useState({
    doctorId: '',
    policyId: '',
    hospitalId: '',
    claimAmount: '',
    medicalRecordIds: [],
    claimType: '',
    description: '',
    documents: []
  })
  const [uploadedFiles, setUploadedFiles] = useState([])

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Early return if user is not loaded
  if (!user || !user.userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not authenticated</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (user && user.userId && !authLoading) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, authLoading])

  const loadData = async () => {
    if (!user || !user.userId) {
      console.log('loadData: User not available', { user })
      return
    }
    
    try {
      if (activeTab === 'claims') {
        await loadClaims()
      } else if (activeTab === 'records') {
        await loadRecords()
      } else if (activeTab === 'profile') {
        await loadProfile()
      }
    } catch (error) {
      console.error('Error in loadData:', error)
    }
  }

  const loadClaims = async () => {
    if (!user || !user.userId) return
    
    try {
      setLoading(true)
      const response = await api.get(`/patient/${user.userId}/claims`)
      setClaims(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error loading claims:', error)
      toast.error(error.response?.data?.message || 'Failed to load claims')
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  const loadRecords = async () => {
    if (!user || !user.userId) return
    
    try {
      setLoading(true)
      const response = await api.get(`/patient/${user.userId}/records`)
      setRecords(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error loading records:', error)
      toast.error(error.response?.data?.message || 'Failed to load records')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    if (!user || !user.userId) return
    
    try {
      setLoading(true)
      const response = await api.get(`/patient/${user.userId}/profile`)
      setProfile(response.data?.data || response.data || null)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error(error.response?.data?.message || 'Failed to load profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setUploadedFiles(prev => [...prev, ...files])
    setClaimForm(prev => ({
      ...prev,
      documents: [...prev.documents, ...files.map(f => f.name)]
    }))
  }

  const handleSubmitClaim = async (e) => {
    e.preventDefault()
    if (!user || !user.userId) {
      toast.error('User not authenticated')
      return
    }
    
    try {
      setLoading(true)
      const response = await api.post('/patient/claim/submit', {
        ...claimForm,
        claimAmount: parseFloat(claimForm.claimAmount),
        medicalRecordIds: claimForm.medicalRecordIds.filter(id => id.trim())
      })
      
      if (response.data.success) {
        toast.success('Claim submitted successfully!')
        // Notify doctor
        if (claimForm.doctorId) {
          notifyClaimSubmitted(user.userId, response.data.data?.claimId || response.data.data?.claim?.claimId || 'NEW', claimForm.doctorId)
        }
        setShowClaimForm(false)
        setClaimForm({
          doctorId: '',
          policyId: '',
          hospitalId: '',
          claimAmount: '',
          medicalRecordIds: [],
          claimType: '',
          description: '',
          documents: []
        })
        setUploadedFiles([])
        await loadClaims()
      }
    } catch (error) {
      console.error('Error submitting claim:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to submit claim')
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { path: '/patient/dashboard', label: 'Claims', icon: <FiFileText className="w-5 h-5" /> },
    { path: '/patient/dashboard', label: 'Medical Records', icon: <FiHeart className="w-5 h-5" /> },
    { path: '/patient/dashboard', label: 'Profile', icon: <FiUser className="w-5 h-5" /> },
    { path: '/patient/dashboard', label: 'Access Control', icon: <FiShield className="w-5 h-5" /> }
  ]

  // Debug logging
  React.useEffect(() => {
    console.log('PatientDashboard rendered', { user, authLoading, activeTab })
  }, [user, authLoading, activeTab])

  return (
    <Layout title="Patient Dashboard" navItems={navItems}>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['claims', 'records', 'profile', 'access'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'claims' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">My Claims</h2>
                  <button
                    onClick={() => setShowClaimForm(!showClaimForm)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Submit New Claim</span>
                  </button>
                </div>

                {showClaimForm && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Submit Insurance Claim</h3>
                    <form onSubmit={handleSubmitClaim} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor ID *</label>
                          <input
                            type="text"
                            value={claimForm.doctorId}
                            onChange={(e) => setClaimForm({ ...claimForm, doctorId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Policy ID *</label>
                          <input
                            type="text"
                            value={claimForm.policyId}
                            onChange={(e) => setClaimForm({ ...claimForm, policyId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hospital ID *</label>
                          <input
                            type="text"
                            value={claimForm.hospitalId}
                            onChange={(e) => setClaimForm({ ...claimForm, hospitalId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Claim Amount *</label>
                          <input
                            type="number"
                            value={claimForm.claimAmount}
                            onChange={(e) => setClaimForm({ ...claimForm, claimAmount: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Claim Type *</label>
                          <input
                            type="text"
                            value={claimForm.claimType}
                            onChange={(e) => setClaimForm({ ...claimForm, claimType: e.target.value })}
                            placeholder="Surgery, Consultation, etc."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Medical Record IDs (comma-separated)</label>
                          <input
                            type="text"
                            value={claimForm.medicalRecordIds.join(', ')}
                            onChange={(e) => setClaimForm({ 
                              ...claimForm, 
                              medicalRecordIds: e.target.value.split(',').map(id => id.trim())
                            })}
                            placeholder="R-abc123, R-def456"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea
                          value={claimForm.description}
                          onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {uploadedFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {uploadedFiles.map((file, idx) => (
                              <p key={idx} className="text-sm text-gray-600">{file.name}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                        >
                          {loading ? 'Submitting...' : 'Submit Claim'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClaimForm(false)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading claims...</p>
                  </div>
                ) : claims.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No claims found</p>
                    <p className="text-sm mt-2">Click "Submit New Claim" to create your first claim</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="font-semibold text-gray-900">{claim.claimId || `Claim #${idx + 1}`}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                                claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {claim.status || 'pending'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Type</p>
                                <p className="font-medium">{claim.claimType || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Amount</p>
                                <p className="font-medium">${claim.claimAmount || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Doctor</p>
                                <p className="font-medium">{claim.doctorId || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Hospital</p>
                                <p className="font-medium">{claim.hospitalId || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Records</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FiHeart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No medical records found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="font-semibold text-gray-900">{record.recordId || `Record #${idx + 1}`}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Diagnosis</p>
                                <p className="font-medium">{record.diagnosis || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Treatment</p>
                                <p className="font-medium">{record.treatment || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-medium">{record.date || '-'}</p>
                              </div>
                            </div>
                            {record.notes && (
                              <div className="mt-3">
                                <p className="text-gray-500 text-sm">Notes</p>
                                <p className="text-sm">{record.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : profile ? (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(profile).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-base font-medium text-gray-900">{value || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No profile data available</p>
                )}
              </div>
            )}

            {activeTab === 'access' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Access Control</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Grant Doctor Access</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      if (!user || !user.userId) {
                        toast.error('User not authenticated')
                        return
                      }
                      const doctorId = e.target.doctorId.value
                      try {
                        const response = await api.post('/patient/grantAccess', { doctorIdToGrant: doctorId })
                        if (response.data.success) {
                          toast.success('Access granted successfully')
                          e.target.reset()
                        }
                      } catch (error) {
                        console.error('Error granting access:', error)
                        toast.error(error.response?.data?.message || 'Failed to grant access')
                      }
                    }} className="flex space-x-3">
                      <input
                        type="text"
                        name="doctorId"
                        placeholder="Doctor ID"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                        Grant Access
                      </button>
                    </form>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Revoke Doctor Access</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      if (!user || !user.userId) {
                        toast.error('User not authenticated')
                        return
                      }
                      const doctorId = e.target.doctorId.value
                      try {
                        const response = await api.post('/patient/revokeAccess', { doctorIdToRevoke: doctorId })
                        if (response.data.success) {
                          toast.success('Access revoked successfully')
                          e.target.reset()
                        }
                      } catch (error) {
                        console.error('Error revoking access:', error)
                        toast.error(error.response?.data?.message || 'Failed to revoke access')
                      }
                    }} className="flex space-x-3">
                      <input
                        type="text"
                        name="doctorId"
                        placeholder="Doctor ID"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        required
                      />
                      <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                        Revoke Access
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PatientDashboard

