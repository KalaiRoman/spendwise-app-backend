import Expense from "../models/Expense.js";

export const addExpense = async (req, res, next) => {
  try {
    const { amount, category, note, date } = req.body;
    const expense = await Expense.create({ user: req.user.id, amount, category, note, date });
    res.status(201).json(expense);
  } catch (err) { next(err); }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ message: "Expense not found." });

    for (const f of ["amount", "category", "note", "date"]) {
      if (req.body[f] !== undefined) expense[f] = req.body[f];
    }
    await expense.save();
    res.json(expense);
  } catch (err) { next(err); }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const removed = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!removed) return res.status(404).json({ message: "Expense not found." });
    res.json({ message: "Expense deleted." });
  } catch (err) { next(err); }
};
