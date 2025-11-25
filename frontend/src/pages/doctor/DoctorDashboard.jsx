import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { 
  FiFileText, FiUser, FiUsers, FiCheckCircle, FiXCircle,
  FiPlus, FiEye
} from 'react-icons/fi'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { notifyClaimVerified } from '../../services/notificationService'

const DoctorDashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('patients')
  const [patients, setPatients] = useState([])
  const [claims, setClaims] = useState([])
  const [profile, setProfile] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientRecords, setPatientRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [recordForm, setRecordForm] = useState({
    patientId: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  })

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

  useEffect(() => {
    if (user && user.userId && !authLoading) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, authLoading])

  const loadData = async () => {
    if (activeTab === 'patients') {
      await loadPatients()
    } else if (activeTab === 'claims') {
      await loadClaims()
    } else if (activeTab === 'profile') {
      await loadProfile()
    }
  }

  const loadPatients = async () => {
    if (!user || !user.userId) return
    
    try {
      setLoading(true)
      const response = await api.get(`/doctor/${user.userId}/patients`)
      setPatients(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error(error.response?.data?.message || 'Failed to load patients')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const loadClaims = async () => {
    if (!user || !user.userId) return
    
    try {
      setLoading(true)
      const response = await api.get(`/claims/byDoctor/${user.userId}`)
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
      const response = await api.get(`/doctor/${user.userId}/profile`)
      setProfile(response.data?.data || response.data || null)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error(error.response?.data?.message || 'Failed to load profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const loadPatientRecords = async (patientId) => {
    try {
      setLoading(true)
      const response = await api.get(`/doctor/records/${patientId}`)
      setPatientRecords(response.data.data || [])
      setSelectedPatient(patientId)
    } catch (error) {
      toast.error('Failed to load patient records')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecord = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.post('/doctor/addRecord', recordForm)
      
      if (response.data.success) {
        toast.success('Medical record added successfully!')
        setShowRecordForm(false)
        setRecordForm({
          patientId: '',
          diagnosis: '',
          treatment: '',
          notes: ''
        })
        if (selectedPatient) {
          loadPatientRecords(selectedPatient)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add record')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyClaim = async (claimId, verified, notes) => {
    try {
      setLoading(true)
      const response = await api.post('/doctor/claim/verify', {
        claimId,
        verified,
        notes
      })
      
      if (response.data.success) {
        toast.success(`Claim ${verified ? 'verified' : 'rejected'} successfully!`)
        // Notify patient and insurance agent
        const claim = claims.find(c => c.claimId === claimId)
        if (claim) {
          notifyClaimVerified(claimId, claim.patientId, 'agent01', verified) // TODO: Get actual agent ID
        }
        loadClaims()
      }
    } catch (error) {
      toast.error('Failed to verify claim')
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { path: '/doctor/dashboard', label: 'Patients', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/doctor/dashboard', label: 'Claims to Verify', icon: <FiFileText className="w-5 h-5" /> },
    { path: '/doctor/dashboard', label: 'Profile', icon: <FiUser className="w-5 h-5" /> }
  ]

  return (
    <Layout title="Doctor Dashboard" navItems={navItems}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['patients', 'claims', 'profile'].map((tab) => (
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
            {activeTab === 'patients' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">My Patients</h2>
                  <button
                    onClick={() => setShowRecordForm(!showRecordForm)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Medical Record</span>
                  </button>
                </div>

                {showRecordForm && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Add Medical Record</h3>
                    <form onSubmit={handleAddRecord} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID *</label>
                          <input
                            type="text"
                            value={recordForm.patientId}
                            onChange={(e) => setRecordForm({ ...recordForm, patientId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
                          <input
                            type="text"
                            value={recordForm.diagnosis}
                            onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Treatment *</label>
                          <input
                            type="text"
                            value={recordForm.treatment}
                            onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={recordForm.notes}
                          onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                        >
                          {loading ? 'Adding...' : 'Add Record'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRecordForm(false)}
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
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No patients assigned</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patients.map((patient, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="font-semibold text-gray-900">{patient.patientId || patient.userId || `Patient #${idx + 1}`}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Name</p>
                                <p className="font-medium">{patient.name || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">City</p>
                                <p className="font-medium">{patient.city || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">DOB</p>
                                <p className="font-medium">{patient.dob || '-'}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => loadPatientRecords(patient.patientId || patient.userId)}
                            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                          >
                            <FiEye className="w-4 h-4" />
                            <span>View Records</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPatient && patientRecords.length > 0 && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Records for {selectedPatient}</h3>
                    <div className="space-y-3">
                      {patientRecords.map((record, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-3 gap-4 text-sm">
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
                            <div className="mt-2">
                              <p className="text-gray-500 text-sm">Notes</p>
                              <p className="text-sm">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'claims' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Claims to Verify</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : claims.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No claims to verify</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {claims.filter(c => c.status === 'pending' || !c.status).map((claim, idx) => (
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
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleVerifyClaim(claim.claimId, true, 'Claim verified by doctor')}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt('Enter rejection reason:')
                                if (notes) {
                                  handleVerifyClaim(claim.claimId, false, notes)
                                }
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

export default DoctorDashboard

