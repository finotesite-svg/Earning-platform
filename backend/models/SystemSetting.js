const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  minWithdrawal: { type: Number, default: 200 },
  referralBonus: { type: Number, default: 50 },
  dailyBonus: { type: Number, default: 50 },
  platformFee: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
