import mongoose from "mongoose";

// One budget per user per month, e.g. { month: "2026-11", amount: 30000 }
const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Month must look like 2026-11"],
    },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Stops duplicate budgets for the same month
budgetSchema.index({ user: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
