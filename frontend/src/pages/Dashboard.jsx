import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../utils/AuthContext'
import { claimsAPI } from '../utils/api'
import axios from 'axios'
import { exportToCSV, filterByStatus, filterByUrgency } from '../utils/exportCSV'
import Layout from '../components/Layout'

// ============================================
// ICON COMPONENTS (Consistent Lucide-style)
// ============================================
const Icons = {
  ClipboardList: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Zap: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  AlertTriangle: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  DollarSign: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Upload: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Download: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  UserPlus: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  FileText: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Clock: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Inbox: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  )
}

// ============================================
// PROGRESS BAR COMPONENT (60-day visualization)
// ============================================
const UrgencyProgressBar = ({ daysRemaining, isExpired }) => {
  const maxDays = 60
  const percentage = isExpired ? 0 : Math.min((daysRemaining / maxDays) * 100, 100)
  
  // Color logic
  let barColor, bgColor, textColor, isPulsing
  if (isExpired) {
    barColor = 'bg-gray-300'
    bgColor = 'bg-gray-100'
    textColor = 'text-gray-500'
    isPulsing = false
  } else if (daysRemaining <= 14) {
    barColor = 'bg-red-500'
    bgColor = 'bg-red-100'
    textColor = 'text-red-700'
    isPulsing = true
  } else if (daysRemaining <= 30) {
    barColor = 'bg-amber-500'
    bgColor = 'bg-amber-100'
    textColor = 'text-amber-700'
    isPulsing = false
  } else {
    barColor = 'bg-emerald-500'
    bgColor = 'bg-emerald-100'
    textColor = 'text-emerald-700'
    isPulsing = false
  }

  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className={`flex-1 h-2 rounded-full ${bgColor} overflow-hidden`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor} ${isPulsing ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-sm font-semibold tabular-nums w-16 text-right ${textColor}`}>
        {isExpired ? 'Expired' : `${daysRemaining}d`}
      </span>
    </div>
  )
}

// ============================================
// TOAST NOTIFICATION COMPONENT
// ============================================
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
  const Icon = type === 'success' ? Icons.CheckCircle : Icons.X
  
  return (
    <div className={`fixed top-6 right-6 z-50 animate-slide-in`}>
      <div className={`${bgColor} text-white px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors">
          <Icons.X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const colorClasses = {
    indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600', value: 'text-gray-900' },
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', value: 'text-gray-900' },
    amber: { bg: 'bg-amber-100', icon: 'text-amber-600', value: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', value: 'text-emerald-600' }
  }
  const colors = colorClasses[color] || colorClasses.indigo

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 ${delay}`}>
      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${colors.icon}`} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${colors.value}`}>{value}</p>
    </div>
  )
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
const EmptyState = ({ onUpload, uploading }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
    <div className="max-w-md mx-auto text-center">
      {/* Illustration */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
        <Icons.Inbox className="w-12 h-12 text-indigo-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No claims found</h3>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Upload your FBA Inventory Adjustments report to discover reimbursable claims and track their deadlines.
      </p>
      
      {/* Upload Zone */}
      <label className="block cursor-pointer">
        <input
          type="file"
          accept=".csv"
          onChange={onUpload}
          disabled={uploading}
          className="hidden"
        />
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 group">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <Icons.Upload className="w-7 h-7 text-indigo-600" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">
              {uploading ? 'Uploading...' : 'Click to upload CSV'}
            </p>
            <p className="text-sm text-gray-400">or drag and drop your file here</p>
          </div>
        </div>
      </label>
    </div>
  </div>
)

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function Dashboard() {
  const { user } = useAuth()
  const [claims, setClaims] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState(null)

  // Invite state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState(null)
  const [inviting, setInviting] = useState(false)

  // Export state
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef(null)

  // Bulk actions state
  const [selectedClaims, setSelectedClaims] = useState([])
  const [toast, setToast] = useState(null)

  // File input ref for header upload button
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const fetchData = async () => {
    try {
      const [claimsRes, statsRes] = await Promise.all([
        claimsAPI.getClaims(),
        claimsAPI.getStats()
      ])
      setClaims(claimsRes.data.claims)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadMessage(null)

    try {
      const response = await claimsAPI.uploadCSV(file)
      showToast(`Successfully imported ${response.data.imported} reimbursable claims`, 'success')
      await fetchData()
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to upload CSV', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleStatusChange = async (claimId, newStatus) => {
    try {
      await claimsAPI.updateStatus(claimId, newStatus)
      setClaims(claims.map(claim =>
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      ))
      showToast('Claim status updated', 'success')
    } catch (error) {
      showToast('Failed to update status', 'error')
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (claimId) => {
    if (!confirm('Are you sure you want to delete this claim?')) return

    try {
      await claimsAPI.deleteClaim(claimId)
      setClaims(claims.filter(claim => claim.id !== claimId))
      showToast('Claim deleted', 'success')
      await fetchData()
    } catch (error) {
      showToast('Failed to delete claim', 'error')
      console.error('Error deleting claim:', error)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviteMessage(null)
    setInviting(true)

    try {
      const response = await axios.post('/api/auth/invite', { email: inviteEmail })
      setInviteMessage({
        type: 'success',
        text: 'Invite sent successfully!',
        link: response.data.inviteLink
      })
      setInviteEmail('')
    } catch (error) {
      setInviteMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to send invite'
      })
    } finally {
      setInviting(false)
    }
  }

  const handleExport = (filterType = 'all', filterValue = null) => {
    let claimsToExport = [...claims]

    if (filterType === 'status' && filterValue) {
      claimsToExport = filterByStatus(claims, filterValue)
    } else if (filterType === 'urgency' && filterValue) {
      claimsToExport = filterByUrgency(claims, filterValue)
    }

    exportToCSV(claimsToExport)
    setShowExportMenu(false)
    showToast('Export downloaded', 'success')
  }

  // Bulk selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedClaims(sortedClaims.map(claim => claim.id))
    } else {
      setSelectedClaims([])
    }
  }

  const handleSelectClaim = (claimId) => {
    setSelectedClaims(prev => {
      if (prev.includes(claimId)) {
        return prev.filter(id => id !== claimId)
      } else {
        return [...prev, claimId]
      }
    })
  }

  // Bulk action handlers
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedClaims.length === 0) return

    try {
      await Promise.all(
        selectedClaims.map(claimId => claimsAPI.updateStatus(claimId, newStatus))
      )

      setClaims(claims.map(claim =>
        selectedClaims.includes(claim.id) ? { ...claim, status: newStatus } : claim
      ))

      showToast(`${selectedClaims.length} claim(s) marked as ${newStatus}`, 'success')
      setSelectedClaims([])
    } catch (error) {
      showToast('Failed to update claims', 'error')
      console.error('Error updating claims:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedClaims.length === 0) return

    const confirmed = confirm(`Are you sure you want to delete ${selectedClaims.length} claim(s)? This action cannot be undone.`)
    if (!confirmed) return

    try {
      await Promise.all(
        selectedClaims.map(claimId => claimsAPI.deleteClaim(claimId))
      )

      setClaims(claims.filter(claim => !selectedClaims.includes(claim.id)))
      showToast(`${selectedClaims.length} claim(s) deleted`, 'success')
      setSelectedClaims([])
      await fetchData()
    } catch (error) {
      showToast('Failed to delete claims', 'error')
      console.error('Error deleting claims:', error)
    }
  }

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Sort claims by urgency (lowest days first)
  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => {
      // Expired items go to bottom
      if (a.is_expired && !b.is_expired) return 1
      if (!a.is_expired && b.is_expired) return -1
      // Sort by days remaining (ascending - most urgent first)
      return (a.days_remaining || 999) - (b.days_remaining || 999)
    })
  }, [claims])

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700',
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700'
    }
    const labels = {
      pending: 'Pending',
      submitted: 'Submitted',
      approved: 'Approved',
      rejected: 'Rejected'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {labels[status] || 'Pending'}
      </span>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Track and manage your FBA reimbursement claims
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Upload Button (shown when claims exist) */}
                {claims.length > 0 && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                      <Icons.Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Report'}
                    </button>
                  </>
                )}
                {user.role === 'owner' && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:transform hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                    }}
                  >
                    <Icons.UserPlus className="w-4 h-4" />
                    Invite Member
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard
                icon={Icons.ClipboardList}
                label="Total Claims"
                value={stats.total || 0}
                color="indigo"
                delay="animate-in-delay-1"
              />
              <StatCard
                icon={Icons.Zap}
                label="Active"
                value={stats.active || 0}
                color="blue"
                delay="animate-in-delay-2"
              />
              <StatCard
                icon={Icons.AlertTriangle}
                label="Expiring Soon"
                value={stats.expiring_soon || 0}
                color="amber"
                delay="animate-in-delay-3"
              />
              <StatCard
                icon={Icons.DollarSign}
                label="Total Value"
                value={`$${stats.total_value ? stats.total_value.toFixed(2) : '0.00'}`}
                color="emerald"
                delay="animate-in-delay-4"
              />
            </div>
          )}

          {/* Empty State or Claims Table */}
          {claims.length === 0 ? (
            <EmptyState onUpload={handleFileUpload} uploading={uploading} />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Claims</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{claims.length} total • Sorted by urgency</p>
                </div>

                {/* Export Button */}
                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:transform hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                    }}
                  >
                    <Icons.Download className="w-4 h-4" />
                    Export CSV
                  </button>

                  {/* Export Dropdown Menu */}
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
                      <button onClick={() => handleExport('all')} className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Export All Claims
                      </button>
                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">By Status</div>
                      <button onClick={() => handleExport('status', 'pending')} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Pending Only</button>
                      <button onClick={() => handleExport('status', 'submitted')} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Submitted Only</button>
                      <button onClick={() => handleExport('status', 'approved')} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Approved Only</button>
                      <button onClick={() => handleExport('status', 'rejected')} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Rejected Only</button>
                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">By Urgency</div>
                      <button onClick={() => handleExport('urgency', 'critical')} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Critical (≤14 days)</button>
                      <button onClick={() => handleExport('urgency', 'medium')} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Medium (15-30 days)</button>
                      <button onClick={() => handleExport('urgency', 'expired')} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Expired Only</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedClaims.length === sortedClaims.length && sortedClaims.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Days Left</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedClaims.includes(claim.id)}
                            onChange={() => handleSelectClaim(claim.id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{claim.sku}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 max-w-[200px] truncate block">{claim.product_name || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{claim.reason}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-gray-900 tabular-nums">{claim.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900 tabular-nums">
                            ${claim.value ? claim.value.toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <UrgencyProgressBar 
                            daysRemaining={claim.days_remaining} 
                            isExpired={claim.is_expired} 
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <select
                            value={claim.status}
                            onChange={(e) => handleStatusChange(claim.id, e.target.value)}
                            className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(claim.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Bar */}
        {selectedClaims.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <div 
              className="px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
            >
              <div className="flex items-center gap-2 text-white">
                <Icons.CheckCircle className="w-5 h-5" />
                <span className="font-semibold">{selectedClaims.length} selected</span>
              </div>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkStatusUpdate('submitted')} className="px-4 py-2 bg-white text-indigo-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">Submitted</button>
                <button onClick={() => handleBulkStatusUpdate('approved')} className="px-4 py-2 bg-white text-indigo-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">Approved</button>
                <button onClick={() => handleBulkStatusUpdate('rejected')} className="px-4 py-2 bg-white text-indigo-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">Rejected</button>
                <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors">
                  <Icons.Trash className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedClaims([])} className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <Icons.X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
                  <p className="text-sm text-gray-500 mt-1">Send an invitation to join your organization</p>
                </div>
                <button 
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteEmail('')
                    setInviteMessage(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleInvite}>
                <div className="mb-5">
                  <label htmlFor="invite-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="colleague@company.com"
                  />
                </div>

                {inviteMessage && (
                  <div className={`mb-5 p-4 rounded-xl text-sm ${inviteMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    <p className="font-medium">{inviteMessage.text}</p>
                    {inviteMessage.link && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold mb-2">Invite link:</p>
                        <input
                          type="text"
                          readOnly
                          value={inviteMessage.link}
                          className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg font-mono"
                          onClick={(e) => e.target.select()}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false)
                      setInviteEmail('')
                      setInviteMessage(null)
                    }}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                    }}
                  >
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
