const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructions: { type: String, required: true },
  link: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  reward: { type: Number, required: true },
  deadline: { type: Date },
  expiresAt: { type: Date, index: true },
  isActive: { type: Boolean, default: true },
  eligibilityRules: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

taskSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Task', taskSchema);
