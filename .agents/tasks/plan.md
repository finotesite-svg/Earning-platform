# Implementation Plan: Missing Features for Earning Platform Backend

This plan implements all missing functionality identified in the user requirements, following the existing patterns in the MERN stack (Express + CommonJS) codebase.

## HIGH PRIORITY FEATURES

- [ ] 1. **Install express-rate-limit dependency**
      Run npm install to add express-rate-limit package required for rate limiting middleware.
      Files: `c:\projects\Earning-platform\backend\package.json`
      Verify: Run `cd backend && npm install express-rate-limit` and confirm package appears in package.json dependencies

- [ ] 2. **Define AuditLog.js model schema**
      Create Mongoose schema with adminId (ObjectId ref User), action (String, required), targetType (String), targetId (ObjectId), details (Mixed), and timestamps. Follow the pattern in `c:\projects\Earning-platform\backend\models\Notification.js` for structure.
      Files: `c:\projects\Earning-platform\backend\models\AuditLog.js`
      Verify: Run `node -e "require('./backend/models/AuditLog')"` from project root and confirm no syntax errors

- [ ] 3. **Define LedgerEntry.js model schema**
      Create Mongoose schema with userId (ObjectId ref User, required), type (enum: ['task_reward', 'referral_bonus', 'daily_bonus', 'withdrawal', 'withdrawal_refund', 'fee'], required), amount (Number, required), reference (Mixed), and createdAt (Date, default Date.now). Follow the pattern in `c:\projects\Earning-platform\backend\models\Referral.js` for enum structure.
      Files: `c:\projects\Earning-platform\backend\models\LedgerEntry.js`
      Verify: Run `node -e "require('./backend/models/LedgerEntry')"` from project root and confirm no syntax errors

- [ ] 4. **Define PaymentEvent.js model schema**
      Create Mongoose schema with userId (ObjectId ref User, required), withdrawalRequestId (ObjectId ref WithdrawalRequest), event (enum: ['initiated', 'completed', 'rejected', 'refunded'], required), amount (Number, required), metadata (Mixed), and timestamps. Follow the pattern in `c:\projects\Earning-platform\backend\models\WithdrawalRequest.js` for enum structure.
      Files: `c:\projects\Earning-platform\backend\models\PaymentEvent.js`
      Verify: Run `node -e "require('./backend/models/PaymentEvent')"` from project root and confirm no syntax errors

- [ ] 5. **Add verification fields to User model**
      Add verificationCode (String), verificationExpiry (Date) fields to User.js schema. Place after isVerified field to group related fields together.
      Files: `c:\projects\Earning-platform\backend\models\User.js`
      Verify: Run `node -e "const User = require('./backend/models/User'); console.log(User.schema.paths.verificationCode ? 'OK' : 'FAIL')"` from project root

- [ ] 6. **Add password reset fields to User model**
      Add resetPasswordToken (String), resetPasswordExpiry (Date) fields to User.js schema. Place after verification fields.
      Files: `c:\projects\Earning-platform\backend\models\User.js`
      Verify: Run `node -e "const User = require('./backend/models/User'); console.log(User.schema.paths.resetPasswordToken ? 'OK' : 'FAIL')"` from project root

- [ ] 7. **Add eligibilityRules field to Task model**
      Add eligibilityRules field (type: Mixed, default: {}) to Task.js schema. Place after isActive field.
      Files: `c:\projects\Earning-platform\backend\models\Task.js`
      Verify: Run `node -e "const Task = require('./backend/models/Task'); console.log(Task.schema.paths.eligibilityRules ? 'OK' : 'FAIL')"` from project root

- [ ] 8. **Create phone verification endpoints in auth.js**
      Add POST /api/auth/send-verification (generates 6-digit code with Math.floor(100000 + Math.random() * 900000), saves to verificationCode and verificationExpiry = Date.now() + 10*60*1000, console.log the code) and POST /api/auth/verify-phone (checks code against verificationCode, verifies verificationExpiry > Date.now(), sets isVerified=true, clears verification fields). Follow error response pattern from existing auth.js routes (status 400 with { message: "..." }).
      Files: `c:\projects\Earning-platform\backend\routes\auth.js`
      Verify: Start server with `cd backend && node server.js`, then test with curl: `curl -X POST http://localhost:5000/api/auth/send-verification -H "Content-Type: application/json" -d "{\"phone\":\"1234567890\"}"` (expect 200 or appropriate error)

- [ ] 9. **Create password reset endpoints in auth.js**
      Add POST /api/auth/forgot-password (finds user by phone, generates resetPasswordToken with crypto.randomBytes(32).toString('hex'), sets resetPasswordExpiry = Date.now() + 60*60*1000, console.log token, sends success message) and POST /api/auth/reset-password (requires token and newPassword, verifies token matches resetPasswordToken and resetPasswordExpiry > Date.now(), hashes password with bcrypt.hash following existing pattern in auth.js register route, updates user.password, clears reset fields). Follow error response pattern from existing auth.js routes.
      Files: `c:\projects\Earning-platform\backend\routes\auth.js`
      Verify: Start server, test forgot-password endpoint with curl: `curl -X POST http://localhost:5000/api/auth/forgot-password -H "Content-Type: application/json" -d "{\"phone\":\"1234567890\"}"` (expect 200 or appropriate error)

- [ ] 10. **Integrate LedgerEntry creation in admin.js submission approval**
      In PUT /submissions/:id route, after User.findByIdAndUpdate (line that increments balance), add: `await LedgerEntry.create({ userId: submission.userId, type: 'task_reward', amount: task.reward, reference: { taskId: task._id, submissionId: submission._id } })`. Require LedgerEntry model at top: `const LedgerEntry = require("../models/LedgerEntry");`.
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, approve a submission via admin panel, then query MongoDB: `use earning_platform; db.ledgerentries.find().pretty()` to confirm entry was created

- [ ] 11. **Integrate LedgerEntry creation in user.js daily claim**
      In POST /daily-claim route in user.js, after User.findOneAndUpdate (the atomic update that increments balance), add: `await LedgerEntry.create({ userId: req.user.userId, type: 'daily_bonus', amount: reward, reference: { claimedAt: now } })`. Require LedgerEntry model at top: `const LedgerEntry = require("../models/LedgerEntry");`.
      Files: `c:\projects\Earning-platform\backend\routes\user.js`
      Verify: Start server, claim daily bonus via user panel, then query MongoDB to confirm ledger entry exists with type 'daily_bonus'

- [ ] 12. **Integrate LedgerEntry creation in auth.js registration referral bonus**
      In POST /register route in auth.js, inside the `if (reward > 0)` block after `User.findByIdAndUpdate(referrer._id, { $inc: { balance: reward } })`, add: `await LedgerEntry.create({ userId: referrer._id, type: 'referral_bonus', amount: reward, reference: { referredUserId: newUser._id } })`. Require LedgerEntry model at top: `const LedgerEntry = require("../models/LedgerEntry");`.
      Files: `c:\projects\Earning-platform\backend\routes\auth.js`
      Verify: Start server, register new user with valid referral code, then query MongoDB to confirm ledger entry created for referrer with type 'referral_bonus'

- [ ] 13. **Integrate LedgerEntry and PaymentEvent creation in withdrawal.js request**
      In POST /request route in withdrawal.js, after WithdrawalRequest.create, add: `await LedgerEntry.create({ userId, type: 'withdrawal', amount: numericAmount, reference: { withdrawalRequestId: withdrawal._id } })` and `await PaymentEvent.create({ userId, withdrawalRequestId: withdrawal._id, event: 'initiated', amount: numericAmount, metadata: { paymentMethod, accountNumber: accountNumber.trim() } })`. Calculate platformFee from SystemSettings (already fetched), deduct fee from withdrawal amount: before user balance update, calculate `const feeAmount = (numericAmount * (settings?.platformFee ?? 0)) / 100`, update balance decrement to use `numericAmount` (full amount including fee), and after withdrawal creation, create fee ledger entry: `await LedgerEntry.create({ userId, type: 'fee', amount: feeAmount, reference: { withdrawalRequestId: withdrawal._id } })`. Require both models at top: `const LedgerEntry = require("../models/LedgerEntry");` and `const PaymentEvent = require("../models/PaymentEvent");`.
      Files: `c:\projects\Earning-platform\backend\routes\withdrawal.js`
      Verify: Start server, submit withdrawal request, query MongoDB to confirm 2 ledger entries (withdrawal + fee) and 1 payment event with event='initiated'

- [ ] 14. **Integrate LedgerEntry and PaymentEvent creation in admin.js withdrawal rejection**
      In PATCH /withdrawals/:id route in admin.js, inside the `if (status === "Rejected")` block after User.findByIdAndUpdate refund, add: `await LedgerEntry.create({ userId: withdrawal.userId, type: 'withdrawal_refund', amount: withdrawal.amount, reference: { withdrawalRequestId: withdrawal._id } })` and `await PaymentEvent.create({ userId: withdrawal.userId, withdrawalRequestId: withdrawal._id, event: 'refunded', amount: withdrawal.amount, metadata: { reason: 'admin_rejection' } })`. For Completed status, add PaymentEvent: `await PaymentEvent.create({ userId: withdrawal.userId, withdrawalRequestId: withdrawal._id, event: 'completed', amount: withdrawal.amount, metadata: {} })`. Require both models at top: `const LedgerEntry = require("../models/LedgerEntry");` and `const PaymentEvent = require("../models/PaymentEvent");`.
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, reject a withdrawal via admin panel, query MongoDB to confirm ledger entry with type='withdrawal_refund' and payment event with event='refunded'

- [ ] 15. **Integrate AuditLog creation in admin.js user status change**
      In PATCH /users/:id/status route in admin.js, after successful User.findByIdAndUpdate, add: `await AuditLog.create({ adminId: req.user.userId, action: 'user_status_change', targetType: 'User', targetId: user._id, details: { isActive } })`. Require AuditLog model at top: `const AuditLog = require("../models/AuditLog");`.
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, change user status via admin panel, query MongoDB: `db.auditlogs.find().pretty()` to confirm audit log entry

- [ ] 16. **Integrate AuditLog creation in admin.js submission approval/rejection**
      In PUT /submissions/:id route in admin.js, after successful TaskSubmission.findOneAndUpdate, add: `await AuditLog.create({ adminId: req.user.userId, action: 'submission_review', targetType: 'TaskSubmission', targetId: submission._id, details: { status, taskId: submission.taskId, userId: submission.userId } })`. Require AuditLog model at top (already added in step 15).
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, approve/reject a submission, query MongoDB to confirm audit log entry with action='submission_review'

- [ ] 17. **Integrate AuditLog creation in admin.js withdrawal approval/rejection**
      In PATCH /withdrawals/:id route in admin.js, after successful WithdrawalRequest.findOneAndUpdate, add: `await AuditLog.create({ adminId: req.user.userId, action: 'withdrawal_review', targetType: 'WithdrawalRequest', targetId: withdrawal._id, details: { status, amount: withdrawal.amount, userId: withdrawal.userId } })`. Require AuditLog model at top (already added in step 15).
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, approve/reject a withdrawal, query MongoDB to confirm audit log entry with action='withdrawal_review'

- [ ] 18. **Integrate AuditLog creation in admin.js settings update**
      In PUT /settings route in admin.js, after successful SystemSetting.findOneAndUpdate, add: `await AuditLog.create({ adminId: req.user.userId, action: 'settings_update', targetType: 'SystemSetting', targetId: settings._id, details: { minWithdrawal: settingsValues[0], referralBonus: settingsValues[1], dailyBonus: settingsValues[2], platformFee: settingsValues[3] } })`. Require AuditLog model at top (already added in step 15).
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, update settings via admin panel, query MongoDB to confirm audit log entry with action='settings_update'

- [ ] 19. **Integrate AuditLog creation in admin.js task create**
      In POST /tasks route in admin.js, after successful Task.create, add: `await AuditLog.create({ adminId: req.user.userId, action: 'task_create', targetType: 'Task', targetId: task._id, details: { title: task.title, reward: task.reward } })`. Require AuditLog model at top (already added in step 15).
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, create a task via admin panel, query MongoDB to confirm audit log entry with action='task_create'

- [ ] 20. **Integrate AuditLog creation in admin.js task delete**
      In DELETE /tasks/:id route in admin.js, after successful Task.findByIdAndUpdate, add: `await AuditLog.create({ adminId: req.user.userId, action: 'task_delete', targetType: 'Task', targetId: task._id, details: { title: task.title } })`. Require AuditLog model at top (already added in step 15).
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, delete a task via admin panel, query MongoDB to confirm audit log entry with action='task_delete'

## MEDIUM PRIORITY FEATURES

- [ ] 21. **Create rate limiting middleware**
      Create `c:\projects\Earning-platform\backend\middleware\rateLimitMiddleware.js` exporting authLimiter (15 requests per 15 minutes, windowMs: 15*60*1000, max: 15) and withdrawalLimiter (5 requests per hour, windowMs: 60*60*1000, max: 5). Use rateLimit from express-rate-limit. Follow structure: `const rateLimit = require("express-rate-limit"); const authLimiter = rateLimit({ windowMs: ..., max: ..., message: "..." }); module.exports = { authLimiter, withdrawalLimiter };`.
      Files: `c:\projects\Earning-platform\backend\middleware\rateLimitMiddleware.js`
      Verify: Run `node -e "const {authLimiter, withdrawalLimiter} = require('./backend/middleware/rateLimitMiddleware'); console.log(authLimiter && withdrawalLimiter ? 'OK' : 'FAIL')"` from project root

- [ ] 22. **Apply rate limiters in server.js**
      In server.js, require rate limiters: `const { authLimiter, withdrawalLimiter } = require("./middleware/rateLimitMiddleware");`. Change `app.use("/api/auth", authRoutes);` to `app.use("/api/auth", authLimiter, authRoutes);`. Change `app.use("/api/withdrawal", withdrawalRoutes);` to `app.use("/api/withdrawal", withdrawalLimiter, withdrawalRoutes);`. Insert after line 13 where cors middleware is applied, before route imports section.
      Files: `c:\projects\Earning-platform\backend\server.js`
      Verify: Start server with `cd backend && node server.js`, make 16 rapid auth requests (e.g., curl POST to /api/auth/login), confirm 16th request returns 429 Too Many Requests

- [ ] 23. **Add admin support ticket management endpoints**
      In admin.js, add GET /admin/support/tickets (returns all SupportTicket records with .populate("userId", "name phone").sort({ createdAt: -1 })), PATCH /admin/support/tickets/:id (validates status in ["open", "in-progress", "resolved"], maps to schema enums: "open"->"Pending", "in-progress"->"In Progress", "resolved"->"Resolved", updates SupportTicket status, returns updated ticket), POST /admin/support/tickets/:id/reply (adds adminReply field to ticket - NOTE: must first add adminReply String field to SupportTicket.js schema, creates Notification for ticket.userId with title "Support ticket update" and message containing the reply). Require SupportTicket at top: `const SupportTicket = require("../models/SupportTicket");` (already imported in support.js, add to admin.js). Follow error response pattern from existing admin routes. Place after /settings route.
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`, `c:\projects\Earning-platform\backend\models\SupportTicket.js`
      Verify: Start server, create support ticket as user, then GET /admin/support/tickets as admin, confirm ticket appears. PATCH ticket status, confirm status updates. POST reply, confirm notification created.

- [ ] 24. **Add task update endpoint**
      In admin.js, add PUT /admin/tasks/:id route. Accept title, description, instructions, reward, deadline, link, eligibilityRules from req.body. Validate title?.trim() exists and reward is positive number. Use Task.findByIdAndUpdate with $set for all fields, { new: true, runValidators: true }. Create AuditLog entry with action='task_update'. Follow error response pattern from existing admin routes (404 if task not found). Place after POST /tasks route.
      Files: `c:\projects\Earning-platform\backend\routes\admin.js`
      Verify: Start server, create a task, then PUT /admin/tasks/:id with updated title/reward, confirm task updates. Query MongoDB to confirm audit log entry with action='task_update'.

## LOW PRIORITY FEATURES

- [ ] 25. **Add notification enhancement endpoints in support.js**
      In support.js, add PATCH /support/notifications/read-all (uses Notification.updateMany({ userId: req.user.userId, isRead: false }, { $set: { isRead: true } }), returns { message: "...", modifiedCount: result.modifiedCount }), DELETE /support/notifications/:id (uses Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.userId }), returns 404 if not found), GET /support/notifications/unread-count (uses Notification.countDocuments({ userId: req.user.userId, isRead: false }), returns { count: ... }). Follow error response pattern from existing support.js routes. Place after existing notification routes.
      Files: `c:\projects\Earning-platform\backend\routes\support.js`
      Verify: Start server, create notifications for user, call GET /support/notifications/unread-count (confirm count > 0), call PATCH /support/notifications/read-all, call GET /support/notifications/unread-count again (confirm count = 0)

- [ ] 26. **Add transaction history endpoint in user.js**
      In user.js, add GET /users/me/transactions route. Query LedgerEntry.find({ userId: req.user.userId }).sort({ createdAt: -1 }). Accept optional ?type= query param (req.query.type), if present and valid (one of the enum values), add to find query: { userId: req.user.userId, type: req.query.type }. Return ledger entries array. Follow error response pattern from existing user.js routes. Require LedgerEntry at top: `const LedgerEntry = require("../models/LedgerEntry");`. Place after GET /referrals route.
      Files: `c:\projects\Earning-platform\backend\routes\user.js`
      Verify: Start server, perform actions that create ledger entries (claim daily bonus, submit task), then GET /users/me/transactions as user, confirm transactions appear. Test with ?type=daily_bonus filter, confirm only daily_bonus entries returned.

## Build and Test Commands

Since this is a Node.js/Express backend with no test framework currently configured:

**Start server**: `cd c:\projects\Earning-platform\backend && node server.js`

**Quick smoke test**: After server starts, run:
```bash
curl http://localhost:5000/
```
Expected output: `{"message":"Earning Platform Backend is running successfully!"}`

**Verify MongoDB connection**: Check server console output for "Connected to MongoDB successfully! 🍃"

**Manual endpoint testing**: Use curl, Postman, or the existing frontend to test each new endpoint. MongoDB queries using `mongosh` or MongoDB Compass to verify data integrity.

## Order of Operations Summary

1. **Dependencies first** (step 1): Install express-rate-limit
2. **Models next** (steps 2-7): Define empty models and add fields to existing models
3. **Authentication features** (steps 8-9): Add verification and password reset endpoints
4. **Financial audit trail** (steps 10-14): Integrate LedgerEntry and PaymentEvent creation across all money-moving operations
5. **Admin audit trail** (steps 15-20): Integrate AuditLog creation across all admin operations
6. **Rate limiting** (steps 21-22): Create middleware and apply to routes
7. **Additional admin features** (steps 23-24): Support ticket management and task updates
8. **User-facing enhancements** (steps 25-26): Notification management and transaction history

This order ensures dependencies are available before use, models exist before routes reference them, and core financial/security features are implemented before convenience features.
