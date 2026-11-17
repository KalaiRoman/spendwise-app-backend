import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); 
    // req.user comes from your auth middleware

    console.log(req.query.month)
    const month = req.query.month;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")) {
      return res.status(400).json({ message: "month must look like 2026-11" });
    }
    const year = month.slice(0, 4);

    const [budgetDoc, items, byCategory, yearRows] = await Promise.all([
      Budget.findOne({ user: userId, month }),

      Expense.find({ user: userId, month }).sort({ date: -1, createdAt: -1 }),

      Expense.aggregate([
        { $match: { user: userId, month } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),

      Expense.aggregate([
        { $match: { user: userId, month: { $regex: `^${year}-` } } },
        { $group: { _id: "$month", spent: { $sum: "$amount" } } },
      ]),
    ]);

    const budgets = await Budget.find({ user: userId, month: { $regex: `^${year}-` } });

    const budget = budgetDoc?.amount || 0;
    const spent = items.reduce((sum, e) => sum + e.amount, 0);

    const spentMap = Object.fromEntries(yearRows.map((r) => [r._id, r.spent]));
    const budgetMap = Object.fromEntries(budgets.map((b) => [b.month, b.amount]));
    const months = Array.from({ length: 12 }, (_, i) => {
      const k = `${year}-${String(i + 1).padStart(2, "0")}`;
      const s = spentMap[k] || 0;
      const b = budgetMap[k] || 0;
      return { month: k, budget: b, spent: s, balance: b - s };
    });

    res.json({
      month,
      budget,
      spent,
      balance: budget - spent,
      categories: byCategory.map((c) => ({ category: c._id, total: c.total })),
      months,
      expenses: items,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load dashboard" });
  }
};
