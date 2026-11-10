# Review Findings - Fixes Applied

## Finding 1: Fee not refunded on withdrawal rejection ✅ FIXED

**Issue:** When a withdrawal was rejected, only the withdrawal amount was refunded. The platform fee deducted at request time was never returned, causing users to lose money even when their withdrawal failed.

**Fix Applied:**
1. Added `feeAmount` field to WithdrawalRequest model schema (default: 0)
2. Updated withdrawal.js to store the calculated fee amount when creating withdrawal request
3. Updated admin.js withdrawal rejection logic to:
   - Refund the total amount: `withdrawal.amount + withdrawal.feeAmount`
   - Create two ledger entries: one for withdrawal refund, one for fee refund
   - Include fee refund information in PaymentEvent metadata

**Files Modified:**
- `backend/models/WithdrawalRequest.js` - Added feeAmount field
- `backend/routes/withdrawal.js` - Store feeAmount during withdrawal creation
- `backend/routes/admin.js` - Refund both amount and fee on rejection

**Verification:**
- All syntax checks passed
- Server starts without errors
- Models load correctly

## Finding 2: Verification code endpoint allows SMS abuse ✅ FIXED

**Issue:** POST /api/auth/send-verification inherited the auth limiter (15 requests per 15 minutes), allowing 60 verification codes per hour. This could lead to SMS enumeration attacks and SMS cost abuse.

**Fix Applied:**
1. Created new `verificationLimiter` in rateLimitMiddleware.js:
   - Window: 1 hour (60 * 60 * 1000 ms)
   - Max requests: 3 per window
   - Message: "Too many verification requests. Please try again later."
2. Applied verificationLimiter specifically to `/send-verification` route in auth.js
3. This limits verification code generation to 3 requests per hour, preventing SMS abuse

**Files Modified:**
- `backend/middleware/rateLimitMiddleware.js` - Added verificationLimiter export
- `backend/routes/auth.js` - Imported and applied verificationLimiter to send-verification endpoint

**Verification:**
- All syntax checks passed
- Server starts without errors
- Rate limiter properly configured

## Summary

Both review findings have been successfully addressed:
1. Fee refund gap closed - users now receive full refund (withdrawal + fee) on rejection
2. Verification endpoint secured - strict rate limit (3/hour) prevents SMS abuse

All verification checks passed:
- ✅ Models load without errors
- ✅ All files pass syntax check
- ✅ Server starts successfully
- ✅ No runtime errors detected
