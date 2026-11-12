# Earning Platform

The project contains a React/Vite frontend in `Frontend` and an Express/MongoDB
API in `backend`.

## Run locally

1. Install frontend dependencies with `npm install`.
2. Install backend dependencies with `npm install --prefix backend`.
3. Copy `backend/.env.example` to `backend/.env` and replace
   `JWT_SECRET` with a random value of at least 32 characters:

   ```text
   MONGO_URI=mongodb://localhost:27017/earning_platform
   JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the API with `npm run server`.
5. In another terminal, start the frontend with `npm run dev`.

### Demo accounts

After MongoDB is running and `backend/.env` is configured, seed local demo
accounts with:

```bash
npm run seed:demo --prefix backend
```

| Account | Phone | Password |
| --- | --- | --- |
| Admin | `+251900000000` | `AdminDemo123!` |
| User | `+251911111111` | `UserDemo123!` |

These accounts are for local testing only. Do not use the demo passwords in
production.

The Vite development server proxies `/api` requests to `http://localhost:5000`.
For another API host, set `VITE_API_BASE_URL` to the API base URL, including
`/api` (for example, `https://api.example.com/api`).

## Connected features

Authentication, task listing/submissions and review, user profiles, daily
rewards, withdrawals, referral tracking, support tickets, notifications, user
administration, role-based access control, and platform settings use the
MongoDB-backed API. Admins can promote or demote other users from the admin
user-management screen; the API always requires at least one active admin.
Withdrawal approval is a manual admin-controlled payment workflow and requires
a payment or transfer reference for auditability. Financial reports include
ledger totals, payout totals, referral totals, and recent audit activity.
