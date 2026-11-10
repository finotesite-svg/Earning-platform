const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    link: { type: String, default: "" },
    reward: { type: Number, required: true },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    eligibilityRules: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
