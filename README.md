# ClaimCountdown

A micro-SaaS application for Amazon FBA sellers to track reimbursable claims and manage 60-day deadlines.

## Features

- Upload FBA Inventory Adjustments CSV reports
- Automatically detect reimbursable claims (Lost, Damaged, Misplaced)
- Track 60-day claim deadlines
- Dashboard with urgency sorting
- Weekly email alerts for expiring claims
- Simple email/password authentication

## Tech Stack

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Authentication**: JWT
- **Email**: Resend

## Setup

### Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   - `JWT_SECRET`: Your JWT secret key
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: Your sender email address

5. Start the server:
   ```bash
   npm run dev
   ```

   The backend will run on http://localhost:3000

### Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:5173

## Usage

1. Register a new account
2. Log in to your dashboard
3. Download your FBA Inventory Adjustments report from Amazon Seller Central
4. Upload the CSV file
5. View and manage your claims
6. Update claim status as you submit them to Amazon
7. Receive weekly email alerts for expiring claims

## Project Structure

```
ClaimCountdown/
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Database models
│   │   ├── utils/          # Utilities (CSV parser, email service)
│   │   └── server.js       # Entry point
│   ├── data/               # SQLite database
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utilities (API, Auth context)
│   │   └── styles/         # CSS files
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Claims
- `POST /api/claims/upload` - Upload CSV file
- `GET /api/claims` - Get all claims
- `GET /api/claims/stats` - Get dashboard statistics
- `PATCH /api/claims/:id/status` - Update claim status
- `DELETE /api/claims/:id` - Delete claim

## License

MIT
