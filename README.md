# Earning Platform

The project contains a React/Vite frontend in `Frontend` and an Express/MongoDB
API in `backend`.

## Run locally

1. Install frontend dependencies with `npm install`.
2. Install backend dependencies with `npm install --prefix backend`.
3. Configure `backend/.env` with:

   ```text
   MONGO_URI=mongodb://localhost:27017/earning_platform
   JWT_SECRET=replace-with-a-long-random-secret
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the API with `npm run server`.
5. In another terminal, start the frontend with `npm run dev`.

The Vite development server proxies `/api` requests to `http://localhost:5000`.
For another API host, set `VITE_API_BASE_URL` to the API base URL, including
`/api` (for example, `https://api.example.com/api`).

## Connected features

Authentication, task listing/submissions and review, user profiles, daily
rewards, withdrawals, referral tracking, support tickets, notifications, user
administration, and platform settings use the MongoDB-backed API.
