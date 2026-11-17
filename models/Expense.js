import mongoose from "mongoose";

export const CATEGORIES = ["Food", "Rent", "Travel", "Bills", "Shopping", "Health", "Other"];

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: [1, "Amount must be greater than 0"] },
    category: { type: String, enum: CATEGORIES, default: "Other" },
    note: { type: String, trim: true, maxlength: 120, default: "" },

    // Stored as "YYYY-MM-DD" text (same as the frontend date input).
    // This avoids timezone problems, for example an IST date shifting by a day.
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must look like 2026-11-12"],
    },
    // "YYYY-MM", filled in automatically from date. Used for fast month queries.
    month: { type: String, index: true },
  },
  { timestamps: true }
);

expenseSchema.pre("validate", function (next) {
  if (this.date) this.month = this.date.slice(0, 7);
  next();
});

// Fast lookups for "this user, this month"
expenseSchema.index({ user: 1, month: 1, date: -1 });

export default mongoose.model("Expense", expenseSchema);
