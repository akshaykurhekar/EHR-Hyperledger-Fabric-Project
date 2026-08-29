import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { 
  FiFileText, FiUser, FiCheckCircle, FiXCircle, FiEye,
  FiDollarSign, FiClock
} from 'react-icons/fi'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { notifyClaimProcessed } from '../../services/notificationService'

const InsuranceDashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('claims')

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
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }
  const [claims, setClaims] = useState([])
  const [profile, setProfile] = useState(null)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [claimDetails, setClaimDetails] = useState(null)
  const [claimRecords, setClaimRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    claimId: '',
    reviewNotes: ''
  })
  const [approveForm, setApproveForm] = useState({
    claimId: '',
    approvedAmount: '',
    notes: ''
  })
  const [rejectForm, setRejectForm] = useState({
    claimId: '',
    rejectionReason: ''
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    if (activeTab === 'claims') {
      await loadClaims()
    } else if (activeTab === 'profile') {
      await loadProfile()
    }
  }

  const loadClaims = async () => {
    if (!user || !user.userId) return
    
    try {
      setLoading(true)
      const response = await api.get('/claims/byStatus', {
        params: { status: 'pending' }
      })
      setClaims(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error loading claims:', error)
      toast.error(error.response?.data?.message || 'Failed to load claims')
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    if (!user || !user.userId) return
    
    try {
      setLoading(true)
      const response = await api.get(`/insurance/agent/${user.userId}/profile`)
      setProfile(response.data?.data || response.data || null)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error(error.response?.data?.message || 'Failed to load profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const loadClaimDetails = async (claimId) => {
    try {
      setLoading(true)
      const [claimResponse, recordsResponse] = await Promise.all([
        api.get(`/insurance/claim/${claimId}`),
        api.get(`/insurance/claim/${claimId}/records`)
      ])
      setClaimDetails(claimResponse.data.data || null)
      setClaimRecords(recordsResponse.data.data || [])
      setSelectedClaim(claimId)
    } catch (error) {
      toast.error('Failed to load claim details')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.post('/insurance/claim/review', reviewForm)
      
      if (response.data.success) {
        toast.success('Claim reviewed successfully!')
        setReviewForm({ claimId: '', reviewNotes: '' })
        loadClaims()
      }
    } catch (error) {
      toast.error('Failed to review claim')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.post('/insurance/claim/approve', {
        ...approveForm,
        approvedAmount: parseFloat(approveForm.approvedAmount)
      })
      
      if (response.data.success) {
        toast.success('Claim approved successfully!')
        // Notify patient
        const claim = claims.find(c => c.claimId === approveForm.claimId)
        if (claim) {
          notifyClaimProcessed(
            approveForm.claimId,
            claim.patientId,
            'approved',
            approveForm.approvedAmount,
            approveForm.notes
          )
        }
        setApproveForm({ claimId: '', approvedAmount: '', notes: '' })
        loadClaims()
      }
    } catch (error) {
      toast.error('Failed to approve claim')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.post('/insurance/claim/reject', rejectForm)
      
      if (response.data.success) {
        toast.success('Claim rejected')
        // Notify patient
        const claim = claims.find(c => c.claimId === rejectForm.claimId)
        if (claim) {
          notifyClaimProcessed(
            rejectForm.claimId,
            claim.patientId,
            'rejected',
            null,
            rejectForm.rejectionReason
          )
        }
        setRejectForm({ claimId: '', rejectionReason: '' })
        loadClaims()
      }
    } catch (error) {
      toast.error('Failed to reject claim')
    } finally {
      setLoading(false)
    }
  }


  const navItems = [
    { path: '/insurance/dashboard', label: 'Claims', icon: <FiFileText className="w-5 h-5" /> },
    { path: '/insurance/dashboard', label: 'Profile', icon: <FiUser className="w-5 h-5" /> }
  ]

  return (
    <Layout title="Insurance Agent Dashboard" navItems={navItems}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['claims', 'profile'].map((tab) => (
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
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Pending Claims</h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : claims.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No pending claims</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="font-semibold text-gray-900">{claim.claimId || `Claim #${idx + 1}`}</span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                {claim.status || 'pending'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <p className="text-gray-500">Type</p>
                                <p className="font-medium">{claim.claimType || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Amount</p>
                                <p className="font-medium">${claim.claimAmount || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Patient</p>
                                <p className="font-medium">{claim.patientId || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Hospital</p>
                                <p className="font-medium">{claim.hospitalId || '-'}</p>
                              </div>
                            </div>
                            {claim.description && (
                              <p className="text-sm text-gray-600 mb-4">{claim.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => loadClaimDetails(claim.claimId)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                            >
                              <FiEye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => {
                                setApproveForm({ ...approveForm, claimId: claim.claimId })
                                document.getElementById('approve-modal').classList.remove('hidden')
                              }}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectForm({ ...rejectForm, claimId: claim.claimId })
                                document.getElementById('reject-modal').classList.remove('hidden')
                              }}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                            >
                              <FiXCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedClaim && claimDetails && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Claim Details</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {Object.entries(claimDetails).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-base font-medium text-gray-900">{value || '-'}</p>
                        </div>
                      ))}
                    </div>
                    {claimRecords.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Related Medical Records</h4>
                        <div className="space-y-2">
                          {claimRecords.map((record, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-sm">{record.recordId || `Record #${idx + 1}`}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Approve Modal */}
                <div id="approve-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Approve Claim</h3>
                    <form onSubmit={handleApprove} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Approved Amount *</label>
                        <input
                          type="number"
                          value={approveForm.approvedAmount}
                          onChange={(e) => setApproveForm({ ...approveForm, approvedAmount: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={approveForm.notes}
                          onChange={(e) => setApproveForm({ ...approveForm, notes: e.target.value })}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        >
                          {loading ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => document.getElementById('approve-modal').classList.add('hidden')}
                          className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Reject Modal */}
                <div id="reject-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Reject Claim</h3>
                    <form onSubmit={handleReject} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                        <textarea
                          value={rejectForm.rejectionReason}
                          onChange={(e) => setRejectForm({ ...rejectForm, rejectionReason: e.target.value })}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {loading ? 'Rejecting...' : 'Reject'}
                        </button>
                        <button
                          type="button"
                          onClick={() => document.getElementById('reject-modal').classList.add('hidden')}
                          className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
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
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default InsuranceDashboard

