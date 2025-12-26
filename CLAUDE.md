# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaimCountdown is a micro-SaaS for Amazon FBA sellers to track reimbursable claims and 60-day deadlines. Users upload CSV files from Amazon Seller Central, and the app automatically detects claims for lost/damaged/misplaced inventory, calculates deadlines, and sends weekly email alerts.

## Development Commands

### Backend (Node.js + Express)
```bash
cd backend
npm install                  # Install dependencies
npm run dev                  # Start dev server with nodemon (port 3000)
npm start                    # Start production server
```

### Frontend (React + Vite)
```bash
cd frontend
npm install                  # Install dependencies
npm run dev                  # Start dev server (port 5173)
npm run build                # Build for production
npm run preview              # Preview production build
```

## Architecture

### Backend Structure
- **Database**: SQLite with `better-sqlite3` (synchronous API)
  - Location: `backend/data/claimcountdown.db`
  - Schema: `users` and `claims` tables
  - Database is initialized on server start via `models/database.js`

- **Authentication**: JWT-based with bcrypt password hashing
  - Token stored in localStorage on frontend
  - `authenticateToken` middleware protects routes
  - 7-day token expiration

- **CSV Parsing**: Uses `csv-parse` library
  - Parser in `utils/csvParser.js` handles multiple date formats
  - Calculates 60-day deadlines from adjustment dates
  - Filters for reimbursable reasons (lost/damaged/misplaced)
  - Case-insensitive column matching for flexibility

- **Email Service**: Resend for transactional emails
  - Scheduled with `node-cron` (Mondays at 9 AM)
  - Weekly alerts for claims expiring in ≤7 days
  - HTML and plain text email templates

### Frontend Structure
- **Routing**: React Router with protected/public route wrappers
- **State**: React Context API for authentication
- **API Client**: Axios with automatic token injection
- **Styling**: Tailwind CSS utility classes

### Key Business Logic
- **60-Day Rule**: Claims must be submitted within 60 days of adjustment date
- **Urgency Sorting**: Claims sorted by expiration (soonest first), expired claims last
- **Status Tracking**: pending → submitted → approved/rejected
- **Color Coding**: Red (≤3 days), Orange (≤7 days), Yellow (≤14 days), Green (>14 days)

## Important Patterns

### Database Access
All database queries use synchronous `better-sqlite3` API:
```javascript
const result = db.prepare('SELECT * FROM claims WHERE user_id = ?').all(userId)
```

Use transactions for bulk inserts:
```javascript
const insertMany = db.transaction((items) => {
  for (const item of items) {
    stmt.run(...)
  }
})
insertMany(data)
```

### CSV Column Mapping
The parser handles variations in Amazon CSV column names:
- `adjustment-date` or `date`
- `sku` or `SKU`
- `product-name` or `Product Name`

### Error Handling
- Backend returns consistent JSON error format: `{ error: 'message' }`
- Frontend displays errors in colored alert boxes
- Authentication errors redirect to login

### Email Alerts
Cron job runs weekly on Mondays. To test immediately:
```javascript
// In server.js, temporarily change to:
cron.schedule('* * * * *', ...) // Runs every minute
```

## Environment Variables

Backend `.env` file requires:
- `PORT`: Server port (default 3000)
- `JWT_SECRET`: Secret for JWT signing (change in production!)
- `RESEND_API_KEY`: API key from resend.com
- `FROM_EMAIL`: Verified sender email
- `FRONTEND_URL`: Frontend URL for CORS and email links

## Database Schema Notes

The `claims` table includes computed fields:
- `deadline_date`: 60 days after `adjustment_date`
- `days_remaining`: Days until deadline (can be negative)
- `is_expired`: Boolean flag for UI filtering

These fields are calculated during CSV upload, not dynamically queried. If needed, add a cron job to update `days_remaining` daily.

## Common Tasks

**Add a new API endpoint:**
1. Add route in `backend/src/routes/claims.js` or `auth.js`
2. Add corresponding function in `frontend/src/utils/api.js`
3. Protect route with `authenticateToken` middleware if needed

**Modify CSV parsing logic:**
Edit `backend/src/utils/csvParser.js`. The `parseCSV` function returns an array of claim objects.

**Change email template:**
Edit `generateEmailHTML` and `generateEmailText` functions in `backend/src/utils/emailService.js`.

**Update database schema:**
Modify `initDatabase()` in `backend/src/models/database.js`. Note: SQLite doesn't support ALTER TABLE well; may need migration strategy for production.
