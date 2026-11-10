const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['task_reward', 'referral_bonus', 'daily_bonus', 'withdrawal', 'withdrawal_refund', 'fee', 'fee_refund'], 
    required: true 
  },
  amount: { type: Number, required: true },
  reference: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
