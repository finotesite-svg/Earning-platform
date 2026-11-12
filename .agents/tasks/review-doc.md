# Backend Implementation Review: Missing Features

Implementation against the "missing functionality" requirement for the Earning Platform backend.

**Watch for:** Misalignment between plan and implementation (confirmed), missing Sequelize migration (confirmed), all three previously-empty models remain MongoDB-based (confirmed), rate limiter not registered in server.js (confirmed).

**Verdict**: CHANGES_REQUESTED

---

## High-level view

The plan document describes a comprehensive MongoDB-to-PostgreSQL migration using Sequelize across all 11 models and 6 route files. The implementation did not execute this migration — all models remain Mongoose-based, the database configuration still uses MongoDB, and server.js still connects to MongoDB. The three previously-empty models (AuditLog, LedgerEntry, PaymentEvent) were correctly populated with Mongoose schemas and are now functional. The User model gained verification and password reset fields as specified. Auth routes now include send-verification, verify-phone, forgot-password, and reset-password endpoints with proper token hashing. Ledger entries are created across the appropriate routes for task rewards, referral bonuses, daily claims, withdrawals, fees, and refunds. Audit logs are created in admin.js for every mutating action. Withdrawal fee calculation and deduction is implemented. The rate limiter middleware was created with three distinct limiters (auth, withdrawal, verification), but the limiters are not consistently applied: authLimiter is applied in server.js to all /api/auth routes, withdrawalLimiter is applied to /api/withdrawal routes, but verificationLimiter is applied at the route level in auth.js rather than server.js. Admin support ticket management routes exist. Task editing (PUT /admin/tasks/:id) exists with eligibility rules support. Notification enhancements (read-all, delete, unread-count) exist. Transaction history endpoint (GET /users/me/transactions) exists with optional type filtering.

<details>
<summary>Issues (8)</summary>

1. **Plan-implementation mismatch** — The plan specifies a MongoDB-to-PostgreSQL migration with Sequelize ORM across 25 steps. The implementation ignored this plan entirely and implemented features using the existing MongoDB/Mongoose stack. Every model file still uses `require("mongoose")` and Mongoose schemas. This is a fundamental deviation from the stated plan.

2. **Empty Sequelize configuration** — Plan step 2 calls for creating `backend/config/database.js` with a Sequelize instance. This file does not exist. The server.js file still uses `mongoose.connect()` instead of `sequelize.authenticate()` and `sequelize.sync()`.

3. **Rate limiter inconsistency** — The verificationLimiter is applied at the route level in auth.js (`router.post("/send-verification", verificationLimiter, ...)`) while authLimiter and withdrawalLimiter are applied globally in server.js. This inconsistency creates confusion about where rate limiting is enforced. Either apply all three in server.js or document why verification requires route-level application.

4. **Verification code hashing gap** — The verification code (6-digit numeric string) is stored in plaintext in `User.verificationCode`. The password reset token is correctly hashed with SHA-256 before storage, but the verification code is not. An attacker with read access to the database could steal verification codes and bypass phone verification. Hash the verification code before storing it.

5. **Ledger entry type "fee" ambiguity** — The LedgerEntry model defines type enum including "fee", and withdrawal.js creates a ledger entry with `type: "fee"` for the platform fee. However, "fee" is a debit (money leaving the user's account), while "withdrawal_refund" is a credit. When a withdrawal is rejected, admin.js creates two entries: one with type "withdrawal_refund" for the amount and another with type "withdrawal_refund" for the fee (with `refundType: "fee"` in reference). This overloads "withdrawal_refund" to mean both withdrawal amount refund and fee refund, making reporting ambiguous. Consider adding "fee_refund" to the type enum or using a single ledger entry with combined amount.

6. **Transaction history lacks pagination** — The transaction history endpoint (GET /users/me/transactions) returns all ledger entries for a user with `.sort({ createdAt: -1 })` and no limit. For a user with thousands of transactions, this will return a massive response. Add pagination (limit, offset or cursor-based) to prevent performance degradation.

7. **Audit log lacks timestamp filtering** — The audit log endpoint (GET /admin/audit-logs) returns the 100 most recent logs with no filtering capability. Admins cannot search by date range, action type, or target. For compliance and forensics, audit logs need query filters (date range, action, targetType, adminId).

8. **Support ticket reply lacks audit trail** — When an admin replies to a support ticket (POST /admin/support/tickets/:id/reply), the reply is stored in `SupportTicket.adminReply` (a single text field), but no AuditLog entry is created. If multiple admins reply over time, there's no history of who said what when. The current schema only supports one reply per ticket. Either create an AuditLog entry for each reply or refactor adminReply to an array of reply objects with timestamps and adminId.

</details>

<details>
<summary>Details</summary>

## Plan vs. implementation: the MongoDB migration that didn't happen

The plan document is titled "MongoDB to PostgreSQL Migration Plan" and outlines 25 steps to convert the Earning Platform backend from MongoDB/Mongoose to PostgreSQL/Sequelize. Step 1 calls for uninstalling mongoose and installing sequelize and pg. Steps 3-13 specify converting each model from Mongoose schemas to Sequelize DataTypes. Steps 17-24 detail converting route query patterns (find → findAll, findById → findByPk, $inc → instance.increment). Step 15 directs updating server.js to replace mongoose.connect() with sequelize.authenticate() and sequelize.sync(). Step 25 instructs creating the PostgreSQL database in pgAdmin4 and verifying all tables are created.

None of this happened. Every model file still begins with `const mongoose = require("mongoose");` and exports `mongoose.model(...)`. The server.js file still uses `mongoose.connect(MONGO_URI)` and logs "Connected to MongoDB successfully! 🍃". No Sequelize dependencies appear in the codebase. The verify-note.md confirms "Server starts without errors" and "Models load correctly", but these are MongoDB models, not Sequelize models.

The implementation instead focused on filling in the three previously-empty models (AuditLog, LedgerEntry, PaymentEvent) with Mongoose schemas, adding verification and reset fields to the User model, implementing the four new auth endpoints (send-verification, verify-phone, forgot-password, reset-password), creating ledger entries in the appropriate routes, adding audit logging to admin actions, fixing the withdrawal fee refund bug, implementing the admin support ticket management routes, adding the task edit endpoint, enhancing notifications with read-all/delete/unread-count, and adding the transaction history endpoint. All of this was done using the existing MongoDB/Mongoose stack.

This is not inherently wrong — the features are implemented and functional — but it contradicts the plan. If the decision was made to stay on MongoDB rather than migrate to PostgreSQL, the plan document should have been updated to reflect this, or a new plan should have been written. A reviewer reading the plan would expect Sequelize code; a reviewer reading the implementation would conclude MongoDB is the chosen stack.

## Previously-empty models now populated with Mongoose schemas

AuditLog, LedgerEntry, and PaymentEvent were empty stubs; they now contain complete Mongoose schemas. AuditLog captures adminId, action, targetType, targetId, and details. LedgerEntry captures userId, type (enum of task_reward, referral_bonus, daily_bonus, withdrawal, withdrawal_refund, fee), amount, and reference. PaymentEvent captures userId, withdrawalRequestId, event (enum of initiated, completed, rejected, refunded), amount, and metadata. The User model gained verificationCode, verificationExpiry, resetPasswordToken, and resetPasswordExpiry fields.

## Verification code stored in plaintext

The auth.js file gained four new endpoints: send-verification, verify-phone, forgot-password, reset-password. The password reset token is correctly hashed with SHA-256 before storage, but the verification code is not. The 6-digit code is stored directly in User.verificationCode. If an attacker gains read access to the database, they can harvest verification codes and bypass phone verification for any account. The reset token doesn't have this vulnerability because only the hash is stored. Hash the verification code with SHA-256 before storing it, the same way the reset token is handled.

## Ledger entry type asymmetry for fee refunds

Ledger entries are created in five route files for all six transaction types: referral_bonus (auth.js /register), task_reward (admin.js submission approval), withdrawal and fee (withdrawal.js /request), withdrawal_refund (admin.js withdrawal rejection), and daily_bonus (user.js /daily-claim).

When a withdrawal is rejected, admin.js creates two ledger entries: one with `type: "withdrawal_refund"` for the withdrawal amount, and another with `type: "withdrawal_refund"` for the fee (with `refundType: "fee"` in the reference). This overloads "withdrawal_refund" to mean both types of refund. The initial deduction uses two distinct types ("withdrawal" and "fee"), but the refund uses one type for both. A ledger report summing "fee" entries will see the deduction but not the refund (labeled "withdrawal_refund"). Add "fee_refund" to the type enum or use a single combined ledger entry to restore symmetry.

## Audit logging gaps

AuditLog entries are created in admin.js for seven action types: user_status_change, task_create, task_update, task_delete, submission_review, withdrawal_review, settings_update. Each entry records adminId, action, targetType, targetId, and details.

Support ticket actions (PATCH /support/tickets/:id status updates and POST /support/tickets/:id/reply) are not audited. Every other admin mutation creates an audit log, but support ticket status changes and replies do not. This creates an accountability gap.

The audit log retrieval endpoint (GET /admin/audit-logs) returns the 100 most recent logs with no filtering. Admins cannot search by date range, action type, targetType, or adminId. For forensic analysis or compliance reporting, retrieving the 100 most recent logs and filtering client-side will miss older entries.



## Rate limiter registration inconsistency

The rateLimitMiddleware.js file defines three limiters: authLimiter (15/15min), withdrawalLimiter (5/hour), verificationLimiter (3/hour). In server.js, authLimiter is applied to /api/auth and withdrawalLimiter to /api/withdrawal. The verificationLimiter is applied at the route level in auth.js (`router.post("/send-verification", verificationLimiter, ...)`), not in server.js. Someone reading server.js to understand rate limiting will see two limiters but not the third. Either apply all three limiters in server.js or document why verificationLimiter requires route-level application.

## Support ticket reply overwrites previous replies

The admin.js reply endpoint (POST /admin/support/tickets/:id/reply) stores the reply in SupportTicket.adminReply (a single String field). If an admin replies multiple times, each reply overwrites the previous one. There's no record of which admin wrote the reply, when, or what prior replies said. The schema only supports one reply per ticket. Refactor adminReply to an array of { adminId, text, timestamp } objects or create a separate TicketReply model.





## Transaction history returns unbounded results

The user.js GET /me/transactions endpoint retrieves all LedgerEntry documents for the authenticated user with no limit. For a user with thousands of entries, this will cause slow response times, high memory usage, and poor frontend performance. Add pagination (limit, offset or cursor-based) with a default limit (e.g., 50 entries per page).



</details>

---

## File map

<details>
<summary>13 files changed</summary>

- **backend/models/AuditLog.js** — Mongoose schema with adminId, action, targetType, targetId, details
- **backend/models/LedgerEntry.js** — Mongoose schema with userId, type enum (6 values), amount, reference
- **backend/models/PaymentEvent.js** — Mongoose schema with userId, withdrawalRequestId, event enum (4 values), amount, metadata
- **backend/models/User.js** — Added verificationCode, verificationExpiry, resetPasswordToken, resetPasswordExpiry fields
- **backend/models/Task.js** — eligibilityRules field already present (Mixed, default {})
- **backend/models/SupportTicket.js** — adminReply and status enum already present
- **backend/middleware/rateLimitMiddleware.js** — Created with authLimiter, withdrawalLimiter, verificationLimiter exports
- **backend/routes/auth.js** — Added send-verification, verify-phone, forgot-password, reset-password endpoints; created ledger entry for referral bonus; verificationLimiter applied at route level
- **backend/routes/admin.js** — Audit log creation for 7 actions; ledger entries for task reward, withdrawal refund (2 entries); payment events for completed/refunded; support ticket status and reply endpoints; task edit (PUT /tasks/:id) with eligibilityRules support
- **backend/routes/withdrawal.js** — Fee calculation and deduction; ledger entries for withdrawal and fee; payment event for initiated; fee stored in WithdrawalRequest.feeAmount
- **backend/routes/user.js** — Ledger entry for daily bonus; transaction history endpoint with optional type filter (no pagination)
- **backend/routes/support.js** — Notification read-all, delete, unread-count endpoints
- **backend/server.js** — Rate limiters applied to /api/auth and /api/withdrawal routers (verificationLimiter not applied here)

Full diff: `git diff main backend/`

</details>
