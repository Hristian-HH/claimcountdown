const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'claimcountdown.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify database methods
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Organizations table
      db.run(`
        CREATE TABLE IF NOT EXISTS organizations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          organization_id INTEGER,
          role TEXT DEFAULT 'member',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        )
      `);

      // Claims table
      db.run(`
        CREATE TABLE IF NOT EXISTS claims (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          organization_id INTEGER NOT NULL,
          uploaded_by INTEGER NOT NULL,
          sku TEXT NOT NULL,
          fnsku TEXT,
          asin TEXT,
          product_name TEXT,
          fulfillment_center_id TEXT,
          detailed_disposition TEXT,
          reason TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          currency TEXT DEFAULT 'USD',
          value REAL,
          adjustment_date DATE NOT NULL,
          deadline_date DATE NOT NULL,
          days_remaining INTEGER,
          is_expired BOOLEAN DEFAULT 0,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Invites table
      db.run(`
        CREATE TABLE IF NOT EXISTS invites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          organization_id INTEGER NOT NULL,
          email TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          invited_by INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
          FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // User preferences table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id INTEGER PRIMARY KEY,
          email_alerts_enabled BOOLEAN DEFAULT 1,
          alert_frequency TEXT DEFAULT 'weekly',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_claims_organization ON claims(organization_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_claims_deadline ON claims(deadline_date)');
      db.run('CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status)');
      db.run('CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token)');
      db.run('CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email)', (err) => {
        if (err) {
          console.error('Error creating indexes:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
}

module.exports = { db, runAsync, getAsync, allAsync, initDatabase };
