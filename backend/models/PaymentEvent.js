const mongoose = require("mongoose");

const paymentEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    withdrawalRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalRequest",
    },
    event: {
      type: String,
      enum: ["initiated", "completed", "rejected", "refunded"],
      required: true,
    },
    amount: { type: Number, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PaymentEvent", paymentEventSchema);
