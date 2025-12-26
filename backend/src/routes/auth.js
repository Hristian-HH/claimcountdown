const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getAsync, runAsync, allAsync } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register - creates new organization
router.post('/register', async (req, res) => {
  try {
    const { email, password, organizationName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create organization
    const orgName = organizationName || `${email.split('@')[0]}'s Team`;
    const orgResult = await runAsync('INSERT INTO organizations (name) VALUES (?)', [orgName]);
    const organizationId = orgResult.lastID;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user as owner
    const userResult = await runAsync(
      'INSERT INTO users (email, password_hash, organization_id, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, organizationId, 'owner']
    );

    // Generate token
    const token = jwt.sign(
      { id: userResult.lastID, email, organizationId, role: 'owner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userResult.lastID,
        email,
        organizationId,
        organizationName: orgName,
        role: 'owner'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user with organization
    const user = await getAsync(`
      SELECT u.*, o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = ?
    `, [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, organizationId: user.organization_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getAsync(`
      SELECT u.id, u.email, u.organization_id, u.role, o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = ?
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      organizationName: user.organization_name,
      role: user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Create invite (owner only)
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can invite members' });
    }

    // Check if email already registered
    const existingUser = await getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if already invited
    const existingInvite = await getAsync(
      'SELECT id FROM invites WHERE email = ? AND organization_id = ? AND status = ?',
      [email, req.user.organizationId, 'pending']
    );
    if (existingInvite) {
      return res.status(400).json({ error: 'Invite already sent to this email' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiry to 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create invite
    await runAsync(
      'INSERT INTO invites (organization_id, email, token, invited_by, expires_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.organizationId, email, token, req.user.id, expiresAt]
    );

    // In a real app, send email here with invite link
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;

    res.json({
      message: 'Invite created successfully',
      inviteLink,
      email
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

// Get pending invites (owner only)
router.get('/invites', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can view invites' });
    }

    const invites = await allAsync(
      `SELECT id, email, status, created_at, expires_at
       FROM invites
       WHERE organization_id = ?
       ORDER BY created_at DESC`,
      [req.user.organizationId]
    );

    res.json({ invites });
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({ error: 'Failed to get invites' });
  }
});

// Accept invite
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Get invite
    const invite = await getAsync(
      `SELECT i.*, o.name as organization_name
       FROM invites i
       LEFT JOIN organizations o ON i.organization_id = o.id
       WHERE i.token = ? AND i.status = ?`,
      [token, 'pending']
    );

    if (!invite) {
      return res.status(404).json({ error: 'Invalid or expired invite' });
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invite has expired' });
    }

    // Check if email already registered
    const existingUser = await getAsync('SELECT id FROM users WHERE email = ?', [invite.email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user as member
    const userResult = await runAsync(
      'INSERT INTO users (email, password_hash, organization_id, role) VALUES (?, ?, ?, ?)',
      [invite.email, passwordHash, invite.organization_id, 'member']
    );

    // Mark invite as accepted
    await runAsync('UPDATE invites SET status = ? WHERE id = ?', ['accepted', invite.id]);

    // Generate token
    const jwtToken = jwt.sign(
      {
        id: userResult.lastID,
        email: invite.email,
        organizationId: invite.organization_id,
        role: 'member'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: userResult.lastID,
        email: invite.email,
        organizationId: invite.organization_id,
        organizationName: invite.organization_name,
        role: 'member'
      }
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

// Get organization members (owner only)
router.get('/members', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can view members' });
    }

    const members = await allAsync(
      'SELECT id, email, role, created_at FROM users WHERE organization_id = ? ORDER BY created_at DESC',
      [req.user.organizationId]
    );

    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

module.exports = router;
