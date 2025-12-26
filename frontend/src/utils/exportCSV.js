/**
 * Export claims data to CSV file
 * @param {Array} claims - Array of claim objects
 * @param {string} filename - Optional filename (default: claimcountdown-export-YYYY-MM-DD.csv)
 */
export function exportToCSV(claims, filename = null) {
  if (!claims || claims.length === 0) {
    alert('No claims to export')
    return
  }

  // Generate filename with current date if not provided
  if (!filename) {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    filename = `claimcountdown-export-${today}.csv`
  }

  // Define CSV headers
  const headers = [
    'SKU',
    'FNSKU',
    'Reason',
    'Quantity',
    'Adjusted Date',
    'Deadline',
    'Days Remaining',
    'Status',
    'Estimated Value'
  ]

  // Convert claims to CSV rows
  const rows = claims.map(claim => {
    return [
      escapeCSVField(claim.sku || ''),
      escapeCSVField(claim.fnsku || ''),
      escapeCSVField(claim.reason || ''),
      claim.quantity || 0,
      claim.adjustment_date || '',
      claim.deadline_date || '',
      claim.is_expired ? 'Expired' : claim.days_remaining,
      escapeCSVField(claim.status || 'pending'),
      claim.value ? claim.value.toFixed(2) : '0.00'
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Escape CSV field to handle commas, quotes, and newlines
 * @param {string} field - Field value to escape
 * @returns {string} - Escaped field value
 */
function escapeCSVField(field) {
  if (field === null || field === undefined) {
    return ''
  }

  const stringField = String(field)

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`
  }

  return stringField
}

/**
 * Filter claims by status
 * @param {Array} claims - All claims
 * @param {string} status - Status to filter by (pending, submitted, approved, rejected)
 * @returns {Array} - Filtered claims
 */
export function filterByStatus(claims, status) {
  if (!status || status === 'all') {
    return claims
  }
  return claims.filter(claim => claim.status === status)
}

/**
 * Filter claims by urgency
 * @param {Array} claims - All claims
 * @param {string} urgency - Urgency level (critical, high, medium, expired)
 * @returns {Array} - Filtered claims
 */
export function filterByUrgency(claims, urgency) {
  if (!urgency || urgency === 'all') {
    return claims
  }

  return claims.filter(claim => {
    if (urgency === 'expired') {
      return claim.is_expired
    }
    if (urgency === 'critical') {
      return !claim.is_expired && claim.days_remaining <= 3
    }
    if (urgency === 'high') {
      return !claim.is_expired && claim.days_remaining > 3 && claim.days_remaining <= 7
    }
    if (urgency === 'medium') {
      return !claim.is_expired && claim.days_remaining > 7 && claim.days_remaining <= 14
    }
    return true
  })
}
