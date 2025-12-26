const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getAsync, runAsync } = require('../models/database');
const { sendTestEmail } = require('../utils/emailService');

const router = express.Router();

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    let preferences = await getAsync(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );

    // If no preferences exist, create default ones
    if (!preferences) {
      await runAsync(
        'INSERT INTO user_preferences (user_id, email_alerts_enabled, alert_frequency) VALUES (?, 1, ?)',
        [req.user.id, 'weekly']
      );

      preferences = {
        user_id: req.user.id,
        email_alerts_enabled: 1,
        alert_frequency: 'weekly'
      };
    }

    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { email_alerts_enabled, alert_frequency } = req.body;

    // Validate alert_frequency
    if (alert_frequency && !['weekly', 'daily'].includes(alert_frequency)) {
      return res.status(400).json({ error: 'Invalid alert frequency' });
    }

    // Check if preferences exist
    const existing = await getAsync(
      'SELECT user_id FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );

    if (existing) {
      // Update existing preferences
      await runAsync(
        `UPDATE user_preferences
         SET email_alerts_enabled = ?,
             alert_frequency = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          email_alerts_enabled !== undefined ? email_alerts_enabled : 1,
          alert_frequency || 'weekly',
          req.user.id
        ]
      );
    } else {
      // Insert new preferences
      await runAsync(
        'INSERT INTO user_preferences (user_id, email_alerts_enabled, alert_frequency) VALUES (?, ?, ?)',
        [
          req.user.id,
          email_alerts_enabled !== undefined ? email_alerts_enabled : 1,
          alert_frequency || 'weekly'
        ]
      );
    }

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Send test email
router.post('/test-email', authenticateToken, async (req, res) => {
  try {
    const result = await sendTestEmail(req.user.id, req.user.email, req.user.organizationId);

    res.json({
      message: 'Test email sent successfully!',
      email: req.user.email
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      error: error.message || 'Failed to send test email. Please check your email configuration.'
    });
  }
});

module.exports = router;
