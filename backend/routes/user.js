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
    const { type } = req.query;
    if (
      type &&
      [
        "task_reward",
        "referral_bonus",
        "daily_bonus",
        "withdrawal",
        "withdrawal_refund",
        "fee",
      ].includes(type)
    ) {
      query.type = type;
    }
    const transactions = await LedgerEntry.find(query).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Unable to load transactions." });
  }
});

module.exports = router;
