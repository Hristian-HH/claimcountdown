require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./models/database');
const authRoutes = require('./routes/auth');
const claimsRoutes = require('./routes/claims');
const settingsRoutes = require('./routes/settings');
const { sendWeeklyAlerts } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Schedule weekly email alerts (every Monday at 9 AM)
cron.schedule('0 9 * * 1', async () => {
  console.log('Running weekly email alerts...');
  try {
    await sendWeeklyAlerts();
    console.log('Weekly alerts sent successfully');
  } catch (error) {
    console.error('Error sending weekly alerts:', error);
  }
});

// Initialize database and start server
db.initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;
