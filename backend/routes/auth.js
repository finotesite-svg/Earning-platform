const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Referral = require("../models/Referral");
const Notification = require("../models/Notification");
const SystemSetting = require("../models/SystemSetting");

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, phone, password, referralCode } = req.body;
    if (!name?.trim() || !phone || !password || password.length < 6) {
      return res.status(400).json({
        message: "Name, phone, and a password of at least 6 characters are required.",
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this phone number already exists." });
    }

    let referrer = null;
    if (referralCode?.trim()) {
      referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase(),
        isActive: true,
      });
      if (!referrer) {
        return res.status(400).json({ message: "Referral code is invalid." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      phone,
      password: hashedPassword,
      balance: 0.0,
      role: "user",
      referralCode: `EP${crypto.randomBytes(5).toString("hex").toUpperCase()}`,
      referredBy: referrer?._id,
    });

    await newUser.save();
    if (referrer) {
      const settings = await SystemSetting.findOne({ key: "platform" });
      const reward = settings?.referralBonus ?? 50;
      await Referral.create({
        referrerId: referrer._id,
        referredUserId: newUser._id,
        reward,
      });
      if (reward > 0) {
        await User.findByIdAndUpdate(referrer._id, {
          $inc: { balance: reward },
        });
        await Notification.create({
          userId: referrer._id,
          title: "Referral bonus credited",
          message: `${reward.toFixed(2)} ETB was credited for a new referral.`,
        });
      }
    }
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "secret_key_here",
      { expiresIn: "7d" },
    );
    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        balance: newUser.balance,
        role: newUser.role,
        referralCode: newUser.referralCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required." });
    }

    const user = await User.findOne({ phone });
    if (!user || !user.isActive) {
      return res
        .status(400)
        .json({ message: "Invalid phone number or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid phone number or password." });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret_key_here",
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        balance: user.balance,
        role: user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
