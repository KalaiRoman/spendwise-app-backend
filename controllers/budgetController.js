import Budget from "../models/Budget.js";

export const setBudget = async (req, res, next) => {
  try {
    const { month } = req.params;
    const amount = Number(req.body.amount);

    console.log(req.body)
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return res.status(400).json({ message: "Month must look like 2026-11." });
    if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ message: "Amount must be 0 or more." });

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, month },
      { amount },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(budget);
  } catch (err) { next(err); }
};
