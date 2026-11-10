const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/Referral');
const Notification = require('../models/Notification');
const SystemSetting = require('../models/SystemSetting');
const LedgerEntry = require('../models/LedgerEntry');
const { verificationLimiter } = require('../middleware/rateLimitMiddleware');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, referralCode } = req.body;
    if (!name?.trim() || !phone || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, phone, and a password of at least 6 characters are required.' });
    }
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: 'User with this phone number already exists.' });

    let referrer = null;
    if (referralCode?.trim()) {
      referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase(), isActive: true });
      if (!referrer) return res.status(400).json({ message: 'Referral code is invalid.' });
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const newUser = await User.create({
      name: name.trim(),
      phone,
      password: hashedPassword,
      balance: 0.0,
      role: 'user',
      referralCode: `EP${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      referredBy: referrer ? referrer._id : null
    });

    if (referrer) {
      const settings = await SystemSetting.findOne({ key: 'platform' });
      const reward = settings ? settings.referralBonus : 50;
      await Referral.create({ referrerId: referrer._id, referredUserId: newUser._id, reward });
      if (reward > 0) {
        referrer.balance = parseFloat(referrer.balance) + reward;
        await referrer.save();
        await LedgerEntry.create({ 
          userId: referrer._id, 
          type: 'referral_bonus', 
          amount: reward, 
          reference: { referredUserId: newUser._id } 
        });
        await Notification.create({ 
          userId: referrer._id, 
          title: 'Referral bonus credited', 
          message: `${reward.toFixed(2)} ETB was credited for a new referral.` 
        });
      }
    }

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secret_key_here', { expiresIn: '7d' });
    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: { id: newUser._id, name: newUser.name, phone: newUser.phone, balance: newUser.balance, role: newUser.role, referralCode: newUser.referralCode }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required.' });
    const user = await User.findOne({ phone });
    if (!user || !user.isActive) return res.status(400).json({ message: 'Invalid phone number or password.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid phone number or password.' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key_here', { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, phone: user.phone, balance: user.balance, role: user.role, referralCode: user.referralCode } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send verification code - Finding #4: Hash verification code
router.post('/send-verification', verificationLimiter, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required.' });
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.verificationCode = crypto.createHash('sha256').update(code).digest('hex');
    user.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    console.log(`Verification code for ${phone}: ${code}`);
    res.json({ message: 'Verification code sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify phone - Finding #4: Compare hashed verification code
router.post('/verify-phone', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'Phone number and verification code are required.' });
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    if (!user.verificationCode || user.verificationCode !== hashedCode || !user.verificationExpiry || user.verificationExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpiry = null;
    await user.save();
    res.json({ message: 'Phone number verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required.' });
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    console.log(`Password reset token for ${phone}: ${resetToken}`);
    res.json({ message: 'Password reset token generated.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, token, newPassword } = req.body;
    if (!phone || !token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Phone, token, and a new password of at least 6 characters are required.' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!user.resetPasswordToken || user.resetPasswordToken !== hashedToken || !user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();
    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
