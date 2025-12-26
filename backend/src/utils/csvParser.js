const { parse } = require('csv-parse/sync');

/**
 * Parse Amazon FBA Inventory Adjustments CSV
 * Expected columns: adjustment-date, sku, fnsku, asin, product-name,
 * fulfillment-center-id, detailed-disposition, reason, quantity, currency, value
 */
function parseCSV(csvContent) {
  return new Promise((resolve, reject) => {
    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true
      });

      const claims = records.map(record => {
        // Parse adjustment date
        const adjustmentDate = parseDate(record['adjustment-date'] || record['date']);
        if (!adjustmentDate) {
          throw new Error(`Invalid date format: ${record['adjustment-date']}`);
        }

        // Calculate 60-day deadline
        const deadlineDate = calculateDeadline(adjustmentDate);
        const daysRemaining = calculateDaysRemaining(deadlineDate);
        const isExpired = daysRemaining < 0;

        return {
          sku: record.sku || record.SKU || '',
          fnsku: record.fnsku || record.FNSKU || '',
          asin: record.asin || record.ASIN || '',
          product_name: record['product-name'] || record['Product Name'] || '',
          fulfillment_center_id: record['fulfillment-center-id'] || record['Fulfillment Center'] || '',
          detailed_disposition: record['detailed-disposition'] || record['Disposition'] || '',
          reason: record.reason || record.Reason || '',
          quantity: parseInt(record.quantity || record.Quantity || '0', 10),
          currency: record.currency || record.Currency || 'USD',
          value: parseFloat(record.value || record.Value || '0'),
          adjustment_date: adjustmentDate,
          deadline_date: deadlineDate,
          days_remaining: daysRemaining,
          is_expired: isExpired ? 1 : 0
        };
      });

      resolve(claims);
    } catch (error) {
      reject(new Error(`CSV parsing error: ${error.message}`));
    }
  });
}

/**
 * Parse date string in various formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
 */
function parseDate(dateString) {
  if (!dateString) return null;

  // Try ISO format first (YYYY-MM-DD)
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return formatDate(date);
  }

  // Try MM/DD/YYYY format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) {
      return formatDate(date);
    }
  }

  return null;
}

/**
 * Calculate deadline date (60 days from adjustment date)
 */
function calculateDeadline(adjustmentDate) {
  const date = new Date(adjustmentDate);
  date.setDate(date.getDate() + 60);
  return formatDate(date);
}

/**
 * Calculate days remaining until deadline
 */
function calculateDaysRemaining(deadlineDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  parseCSV,
  calculateDeadline,
  calculateDaysRemaining,
  formatDate
};
