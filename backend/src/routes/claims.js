const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { runAsync, getAsync, allAsync } = require('../models/database');
const { parseCSV, calculateDeadline } = require('../utils/csvParser');

const router = express.Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Upload and parse CSV
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const claims = await parseCSV(csvContent);

    // Filter reimbursable claims (Lost, Damaged, Misplaced)
    const reimbursableClaims = claims.filter(claim => {
      const reason = claim.reason.toLowerCase();
      return reason.includes('lost') || reason.includes('damaged') || reason.includes('misplaced');
    });

    if (reimbursableClaims.length === 0) {
      return res.status(200).json({
        message: 'No reimbursable claims found in the uploaded file',
        total: claims.length,
        reimbursable: 0
      });
    }

    // Insert claims into database
    const insertSQL = `
      INSERT INTO claims (
        organization_id, uploaded_by, sku, fnsku, asin, product_name, fulfillment_center_id,
        detailed_disposition, reason, quantity, currency, value,
        adjustment_date, deadline_date, days_remaining, is_expired
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Insert each claim
    for (const claim of reimbursableClaims) {
      await runAsync(insertSQL, [
        req.user.organizationId,
        req.user.id,
        claim.sku,
        claim.fnsku,
        claim.asin,
        claim.product_name,
        claim.fulfillment_center_id,
        claim.detailed_disposition,
        claim.reason,
        claim.quantity,
        claim.currency,
        claim.value,
        claim.adjustment_date,
        claim.deadline_date,
        claim.days_remaining,
        claim.is_expired
      ]);
    }

    res.json({
      message: 'CSV processed successfully',
      total: claims.length,
      reimbursable: reimbursableClaims.length,
      imported: reimbursableClaims.length
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process CSV file' });
  }
});

// Get all claims for organization (sorted by urgency)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const claims = await allAsync(`
      SELECT c.*, u.email as uploaded_by_email
      FROM claims c
      LEFT JOIN users u ON c.uploaded_by = u.id
      WHERE c.organization_id = ?
      ORDER BY c.is_expired ASC, c.days_remaining ASC
    `, [req.user.organizationId]);

    res.json({ claims });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Get dashboard stats for organization
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await getAsync(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_expired = 0 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_expired = 1 THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN days_remaining <= 7 AND is_expired = 0 THEN 1 ELSE 0 END) as expiring_soon,
        SUM(value) as total_value
      FROM claims
      WHERE organization_id = ?
    `, [req.user.organizationId]);

    res.json(stats || { total: 0, active: 0, expired: 0, expiring_soon: 0, total_value: 0 });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Update claim status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'submitted', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await runAsync(`
      UPDATE claims
      SET status = ?
      WHERE id = ? AND organization_id = ?
    `, [status, id, req.user.organizationId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete claim
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await runAsync(`
      DELETE FROM claims
      WHERE id = ? AND organization_id = ?
    `, [id, req.user.organizationId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.json({ message: 'Claim deleted successfully' });
  } catch (error) {
    console.error('Delete claim error:', error);
    res.status(500).json({ error: 'Failed to delete claim' });
  }
});

module.exports = router;
