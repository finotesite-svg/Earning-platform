const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const Referral = require("../models/Referral");
const Notification = require("../models/Notification");
const SystemSetting = require("../models/SystemSetting");
const LedgerEntry = require("../models/LedgerEntry");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name phone balance role referralCode dailyStreak lastDailyClaimAt",
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Unable to load profile." });
  }
});

router.patch("/me", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: "Name and phone are required." });
    }

    const duplicate = await User.findOne({
      phone: phone.trim(),
      _id: { $ne: req.user.userId },
    });
    if (duplicate) {
      return res.status(409).json({ message: "Phone number is already in use." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { name: name.trim(), phone: phone.trim() } },
      { new: true, runValidators: true },
    ).select("name phone balance role referralCode");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Unable to update profile." });
  }
});

router.patch("/me/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Current password and a new password of at least 6 characters are required.",
      });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }
    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unable to update password." });
  }
});

router.get("/me/payment-accounts", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("paymentAccounts");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user.paymentAccounts || []);
  } catch (error) {
    res.status(500).json({ message: "Unable to load payment accounts." });
  }
});

router.get("/recharge-accounts", async (req, res) => {
  try {
    const settings = await SystemSetting.findOne({ key: "platform" }).select(
      "rechargeAccounts",
    );
    res.json(settings?.rechargeAccounts || []);
  } catch (error) {
    res.status(500).json({ message: "Unable to load recharge accounts." });
  }
});

router.post("/me/payment-accounts", async (req, res) => {
  try {
    const { method, accountNumber, accountName } = req.body;
    const trimmedAccount = accountNumber?.trim();
    const trimmedAccountName = accountName?.trim();
    if (!["telebirr", "bank"].includes(method) || !trimmedAccount || !trimmedAccountName) {
      return res.status(400).json({
        message: "Choose Telebirr or CBE and provide the account number and owner name.",
      });
    }
    if (trimmedAccount.length > 64) {
      return res.status(400).json({ message: "Account number is too long." });
    }
    if (trimmedAccountName.length > 120) {
      return res.status(400).json({ message: "Account owner name is too long." });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (
      user.paymentAccounts.some(
        (account) =>
          account.method === method && account.accountNumber === trimmedAccount,
      )
    ) {
      return res.status(409).json({ message: "This payment account is already saved." });
    }
    if (user.paymentAccounts.length >= 5) {
      return res.status(400).json({ message: "You can save up to five payment accounts." });
    }

    user.paymentAccounts.push({
      method,
      accountNumber: trimmedAccount,
      accountName: trimmedAccountName,
      status: "Pending",
    });
    await user.save();
    res.status(201).json({
      message: "Payment account submitted for admin approval.",
      paymentAccounts: user.paymentAccounts,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to save payment account." });
  }
});

router.patch("/me/payment-accounts/:id", async (req, res) => {
  try {
    const { method, accountNumber, accountName } = req.body;
    const trimmedAccount = accountNumber?.trim();
    const trimmedAccountName = accountName?.trim();
    if (!["telebirr", "bank"].includes(method) || !trimmedAccount || !trimmedAccountName) {
      return res.status(400).json({
        message: "Choose Telebirr or CBE and provide the account number and owner name.",
      });
    }
    if (trimmedAccount.length > 64) {
      return res.status(400).json({ message: "Account number is too long." });
    }
    if (trimmedAccountName.length > 120) {
      return res.status(400).json({ message: "Account owner name is too long." });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    const account = user.paymentAccounts.id(req.params.id);
    if (!account) return res.status(404).json({ message: "Payment account not found." });
    if (
      user.paymentAccounts.some(
        (item) =>
          String(item._id) !== String(account._id) &&
          item.method === method &&
          item.accountNumber === trimmedAccount,
      )
    ) {
      return res.status(409).json({ message: "This payment account is already saved." });
    }

    account.method = method;
    account.accountNumber = trimmedAccount;
    account.accountName = trimmedAccountName;
    account.status = "Pending";
    account.reviewedBy = undefined;
    account.reviewedAt = undefined;
    account.rejectionReason = undefined;
    await user.save();
    res.json({
      message: "Payment account updated and submitted for admin approval.",
      paymentAccounts: user.paymentAccounts,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to update payment account." });
  }
});

router.delete("/me/payment-accounts/:id", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    const account = user.paymentAccounts.id(req.params.id);
    if (!account) return res.status(404).json({ message: "Payment account not found." });
    account.deleteOne();
    await user.save();
    res.json({ message: "Payment account removed.", paymentAccounts: user.paymentAccounts });
  } catch (error) {
    res.status(500).json({ message: "Unable to remove payment account." });
  }
});

router.get("/referrals", async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user.userId })
      .populate("referredUserId", "name phone")
      .sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: "Unable to load referrals." });
  }
});

router.post("/daily-claim", async (req, res) => {
  try {
    const settings = await SystemSetting.findOne({ key: "platform" });
    const reward = settings?.dailyBonus ?? 50;
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const user = await User.findOneAndUpdate(
      {
        _id: req.user.userId,
        $or: [
          { lastDailyClaimAt: { $exists: false } },
          { lastDailyClaimAt: { $lte: cutoff } },
        ],
      },
      {
        $set: { lastDailyClaimAt: now },
        $inc: { balance: reward, dailyStreak: 1 },
      },
      { new: true },
    ).select("balance dailyStreak lastDailyClaimAt");

    if (!user) {
      return res.status(429).json({
        message: "Daily bonus has already been claimed. Please try again later.",
      });
    }
    await LedgerEntry.create({
      userId: req.user.userId,
      type: "daily_bonus",
      amount: reward,
      reference: { claimedAt: now },
    });
    await Notification.create({
      userId: req.user.userId,
      title: "Daily bonus credited",
      message: `${reward.toFixed(2)} ETB was added to your balance.`,
    });
    res.json({ message: "Daily bonus claimed.", reward, user });
  } catch (error) {
    res.status(500).json({ message: "Unable to claim daily bonus." });
  }
});

router.get("/me/transactions", async (req, res) => {
  try {
    const query = { userId: req.user.userId };
    const { type, page = 1, limit = 50 } = req.query;
    
    // Finding #6: Add pagination with default limit of 50
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100); // Cap at 100 per page
    const skip = (pageNum - 1) * limitNum;
    
    // Finding #5: Add fee_refund to valid types
    if (
      type &&
      [
        "task_reward",
        "referral_bonus",
        "daily_bonus",
        "withdrawal",
        "withdrawal_refund",
        "fee",
        "fee_refund"
      ].includes(type)
    ) {
      query.type = type;
    }
    
    const [transactions, total] = await Promise.all([
      LedgerEntry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      LedgerEntry.countDocuments(query)
    ]);
    
    res.json({ 
      transactions, 
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to load transactions." });
  }
});

module.exports = router;
