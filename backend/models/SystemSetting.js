const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  minWithdrawal: { type: Number, default: 200 },
  referralBonus: { type: Number, default: 50 },
  dailyBonus: { type: Number, default: 50 },
  platformFee: { type: Number, default: 5 },
  rechargeAccounts: [{
    method: { type: String, enum: ['telebirr', 'bank'], required: true },
    accountNumber: { type: String, required: true, trim: true },
    accountName: { type: String, trim: true, default: '' },
    logo: { type: String, trim: true, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
