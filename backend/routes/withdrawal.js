const express = require("express");
const router = express.Router();
const WithdrawalRequest = require("../models/WithdrawalRequest");
const User = require("../models/User");
const SystemSetting = require("../models/SystemSetting");
const authMiddleware = require("../middleware/authMiddleware");

// Request withdrawal
router.post("/request", authMiddleware, async (req, res) => {
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

    const settings = await SystemSetting.findOne({ key: "platform" });
    if (numericAmount < (settings?.minWithdrawal ?? 0)) {
      return res.status(400).json({
        message: `Minimum withdrawal is ${settings.minWithdrawal} ETB.`,
      });
    }
    const user = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: numericAmount } },
      { $inc: { balance: -numericAmount } },
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
        paymentMethod,
        accountNumber: accountNumber.trim(),
        status: "Pending",
      });
    } catch (error) {
      await User.findByIdAndUpdate(userId, { $inc: { balance: numericAmount } });
      throw error;
    }

    res.status(201).json({
      message: "Withdrawal request submitted successfully.",
      withdrawal,
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
