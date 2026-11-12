const express = require("express");
const router = express.Router();
const WithdrawalRequest = require("../models/WithdrawalRequest");
const User = require("../models/User");
const SystemSetting = require("../models/SystemSetting");
const LedgerEntry = require("../models/LedgerEntry");
const PaymentEvent = require("../models/PaymentEvent");
const authMiddleware = require("../middleware/authMiddleware");
const { withdrawalLimiter } = require("../middleware/rateLimitMiddleware");

// Request withdrawal
router.post("/request", withdrawalLimiter, authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod, accountNumber } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid withdrawal amount." });
    }
    if (!["telebirr", "bank"].includes(paymentMethod) || !accountNumber?.trim()) {
      return res.status(400).json({
        message: "A valid payment method and account number are required.",
      });
    }
    const userId = req.user.userId;
    const approvedAccount = await User.findOne({
      _id: userId,
      paymentAccounts: {
        $elemMatch: {
          method: paymentMethod,
          accountNumber: accountNumber.trim(),
          status: "Approved",
        },
      },
    });
    const account = approvedAccount?.paymentAccounts.find(
      (item) =>
        item.method === paymentMethod &&
        item.accountNumber === accountNumber.trim() &&
        item.status === "Approved",
    );
    if (!account) {
      return res.status(400).json({
        message: "Select an approved payment account from your profile.",
      });
    }

    const settings = await SystemSetting.findOne({ key: "platform" });
    if (numericAmount < (settings?.minWithdrawal ?? 0)) {
      return res.status(400).json({
        message: `Minimum withdrawal is ${settings.minWithdrawal} ETB.`,
      });
    }
    const feeAmount = (numericAmount * (settings?.platformFee ?? 0)) / 100;
    const totalDeduction = numericAmount + feeAmount;
    const user = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: totalDeduction } },
      { $inc: { balance: -totalDeduction } },
      { new: true },
    );
    if (!user) {
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(404).json({ message: "User not found." });
      }
      return res.status(400).json({ message: "Insufficient balance." });
    }

    let withdrawal;
    try {
      withdrawal = await WithdrawalRequest.create({
        userId,
        amount: numericAmount,
        feeAmount: feeAmount,
        paymentMethod,
        accountNumber: accountNumber.trim(),
        accountName: account.accountName,
        status: "Pending",
      });
      await LedgerEntry.create({
        userId,
        type: "withdrawal",
        amount: numericAmount,
        reference: { withdrawalRequestId: withdrawal._id },
      });
      await LedgerEntry.create({
        userId,
        type: "fee",
        amount: feeAmount,
        reference: { withdrawalRequestId: withdrawal._id },
      });
      await PaymentEvent.create({
        userId,
        withdrawalRequestId: withdrawal._id,
        event: "initiated",
        amount: numericAmount,
        metadata: { paymentMethod, accountNumber: accountNumber.trim() },
      });
    } catch (error) {
      await User.findByIdAndUpdate(userId, { $inc: { balance: totalDeduction } });
      throw error;
    }

    res.status(201).json({
      message: "Withdrawal request submitted successfully.",
      withdrawal,
      balance: user.balance,
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({ message: "Unable to submit the withdrawal request." });
  }
});

// Get user's withdrawal history
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select("amount paymentMethod accountNumber status createdAt");
    res.json(requests);
  } catch (error) {
    console.error("Withdrawal history error:", error);
    res.status(500).json({ message: "Unable to load withdrawal history." });
  }
});

module.exports = router;
