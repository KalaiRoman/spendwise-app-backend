# Spendwise Backend

Node.js + Express + MongoDB API for the Spendwise dashboard.

## Run
    npm install
    cp .env.example .env     # then edit JWT_SECRET and MONGO_URI
    npm run dev

## API
Public
- POST /api/auth/signup            { name, email, password }
- POST /api/auth/login             { email, password }
- POST /api/auth/forgot-password   { email }
- POST /api/auth/reset-password/:token   { password }

Needs header  Authorization: Bearer <token>
- GET  /api/auth/me
- PUT  /api/auth/change-password   { currentPassword, newPassword }
- GET  /api/dashboard?month=2026-11
- POST /api/expenses               { amount, category, note, date }
- PUT  /api/expenses/:id
- DELETE /api/expenses/:id
- PUT  /api/budgets/:month         { amount }
