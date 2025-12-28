import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../utils/AuthContext'
import { claimsAPI } from '../utils/api'
import axios from 'axios'
import { exportToCSV, filterByStatus, filterByUrgency } from '../utils/exportCSV'
import Layout from '../components/Layout'

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
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
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
      setUploadMessage({
        type: 'success',
        text: `Successfully imported ${response.data.imported} reimbursable claims`
      })
      await fetchData()
    } catch (error) {
      setUploadMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to upload CSV'
      })
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
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (claimId) => {
    if (!confirm('Are you sure you want to delete this claim?')) return

    try {
      await claimsAPI.deleteClaim(claimId)
      setClaims(claims.filter(claim => claim.id !== claimId))
      await fetchData() // Refresh stats
    } catch (error) {
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
  }

  // Bulk selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedClaims(claims.map(claim => claim.id))
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
      await fetchData() // Refresh stats
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

  const getDaysColor = (daysRemaining, isExpired) => {
    if (isExpired) return 'text-gray-400'
    if (daysRemaining <= 3) return 'text-red-600 font-bold'
    if (daysRemaining <= 7) return 'text-orange-600 font-semibold'
    if (daysRemaining <= 14) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUrgencyPill = (daysRemaining, isExpired) => {
    if (isExpired) return { text: 'Expired', class: 'pill pill-expired animate-pulse' }
    if (daysRemaining <= 3) return { text: `${daysRemaining} days`, class: 'pill pill-critical animate-pulse' }
    if (daysRemaining <= 7) return { text: `${daysRemaining} days`, class: 'pill pill-high' }
    if (daysRemaining <= 14) return { text: `${daysRemaining} days`, class: 'pill pill-medium' }
    return { text: `${daysRemaining} days`, class: 'pill pill-safe' }
  }

  const getStatusPill = (status) => {
    const statusMap = {
      pending: { text: 'Pending', class: 'pill pill-pending' },
      submitted: { text: 'Submitted', class: 'pill pill-submitted' },
      approved: { text: 'Approved', class: 'pill pill-approved' },
      rejected: { text: 'Rejected', class: 'pill pill-rejected' }
    }
    return statusMap[status] || statusMap.pending
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-72px)] bg-app-bg">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-72px)] bg-app-bg">
        {/* Header Section */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-border-subtle">
          <div className="container-app py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">Dashboard</h1>
                <p className="text-sm text-text-secondary mt-1.5">
                  Track and manage your FBA reimbursement claims
                </p>
              </div>
              {user.role === 'owner' && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn btn-primary"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Invite Member
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-app py-8">
          {/* Stats Cards with Animation */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card animate-in-delay-1">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Total Claims</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total || 0}</p>
              </div>

              <div className="card animate-in-delay-2">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.active || 0}</p>
              </div>

              <div className="card animate-in-delay-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Expiring Soon</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.expiring_soon || 0}</p>
              </div>

              <div className="card animate-in-delay-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  ${stats.total_value ? stats.total_value.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="card mb-8 animate-in-delay-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Upload Claims Report</h2>
                <p className="text-sm text-text-secondary mt-1">Import your FBA Inventory Adjustments CSV file</p>
              </div>
            </div>

            <label className="relative block">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="csv-upload"
              />
              <div className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-text-primary mb-1">
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-text-muted">CSV files only</p>
                </div>
              </div>
            </label>

            {uploadMessage && (
              <div className={`mt-4 p-4 rounded-lg text-sm ${uploadMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {uploadMessage.text}
              </div>
            )}
          </div>

          {/* Claims Table */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-5 border-b border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Claims</h2>
                <p className="text-sm text-text-muted mt-0.5">{claims.length} total claims</p>
              </div>

              {/* Export Button */}
              {claims.length > 0 && (
                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="btn btn-primary"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>

                  {/* Export Dropdown Menu */}
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-modal border border-border-subtle py-2 z-10 animate-scale-in">
                      <button onClick={() => handleExport('all')} className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors">
                        Export All Claims
                      </button>
                      <div className="border-t border-border-subtle my-2"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">By Status</div>
                      <button onClick={() => handleExport('status', 'pending')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">Pending Only</button>
                      <button onClick={() => handleExport('status', 'submitted')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">Submitted Only</button>
                      <button onClick={() => handleExport('status', 'approved')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">Approved Only</button>
                      <button onClick={() => handleExport('status', 'rejected')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">Rejected Only</button>
                      <div className="border-t border-border-subtle my-2"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">By Urgency</div>
                      <button onClick={() => handleExport('urgency', 'critical')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">Critical (≤3 days)</button>
                      <button onClick={() => handleExport('urgency', 'high')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">High (4-7 days)</button>
                      <button onClick={() => handleExport('urgency', 'medium')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">Medium (8-14 days)</button>
                      <button onClick={() => handleExport('urgency', 'expired')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">Expired Only</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {claims.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-text-muted font-medium">No claims yet</p>
                <p className="text-sm text-text-muted mt-1">Upload a CSV file to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-subtle">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedClaims.length === claims.length && claims.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-accent border-border-subtle rounded focus:ring-accent"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">SKU</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Reason</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Qty</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Value</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Deadline</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Days Left</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border-subtle">
                    {claims.map((claim) => {
                      const urgencyPill = getUrgencyPill(claim.days_remaining, claim.is_expired)
                      const statusPill = getStatusPill(claim.status)
                      return (
                        <tr key={claim.id} className="hover:bg-accent/4 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedClaims.includes(claim.id)}
                              onChange={() => handleSelectClaim(claim.id)}
                              className="w-4 h-4 text-accent border-border-subtle rounded focus:ring-accent"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{claim.sku}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate">{claim.product_name || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{claim.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{claim.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">
                            ${claim.value ? claim.value.toFixed(2) : '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{claim.deadline_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={urgencyPill.class}>{urgencyPill.text}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={claim.status}
                              onChange={(e) => handleStatusChange(claim.id, e.target.value)}
                              className="text-xs font-medium border border-border-subtle rounded-lg px-3 py-1.5 focus:ring-accent focus:border-accent bg-white text-text-primary"
                            >
                              <option value="pending">Pending</option>
                              <option value="submitted">Submitted</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(claim.id)}
                              className="text-danger hover:text-red-700 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Bar */}
        {selectedClaims.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
            <div className="px-6 py-4 rounded-xl shadow-glow flex items-center gap-6" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}>
              <div className="flex items-center gap-2 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="font-semibold">{selectedClaims.length} selected</span>
              </div>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkStatusUpdate('submitted')} className="px-4 py-2 bg-white text-accent text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">Mark Submitted</button>
                <button onClick={() => handleBulkStatusUpdate('approved')} className="px-4 py-2 bg-white text-accent text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">Mark Approved</button>
                <button onClick={() => handleBulkStatusUpdate('rejected')} className="px-4 py-2 bg-white text-accent text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">Mark Rejected</button>
                <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
                <button onClick={() => setSelectedClaims([])} className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors" title="Clear selection">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-24 right-8 z-50 animate-slide-in">
            <div className={`rounded-xl shadow-lg px-6 py-4 flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full animate-scale-in">
              <h3 className="text-xl font-bold text-text-primary mb-2">Invite Team Member</h3>
              <p className="text-sm text-text-secondary mb-6">Send an invitation to join your organization</p>
              <form onSubmit={handleInvite}>
                <div className="mb-5">
                  <label htmlFor="invite-email" className="block text-sm font-semibold text-text-primary mb-2">
                    Email address
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input"
                    placeholder="colleague@company.com"
                  />
                </div>

                {inviteMessage && (
                  <div className={`mb-5 p-4 rounded-lg text-sm ${inviteMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    <p className="font-medium">{inviteMessage.text}</p>
                    {inviteMessage.link && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold mb-2">Invite link:</p>
                        <input
                          type="text"
                          readOnly
                          value={inviteMessage.link}
                          className="w-full px-3 py-2 text-xs bg-white border border-green-300 rounded-lg font-mono"
                          onClick={(e) => e.target.select()}
                        />
                        <p className="text-xs mt-2">Copy and share this link with your colleague</p>
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
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="btn btn-primary flex-1"
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
