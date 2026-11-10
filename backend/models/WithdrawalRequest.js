const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    feeAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["telebirr", "bank"], required: true },
    accountNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("WithdrawalRequest", withdrawalSchema);
