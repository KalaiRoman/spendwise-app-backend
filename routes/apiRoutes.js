import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getDashboard } from "../controllers/dashboardController.js";
import { addExpense, updateExpense, deleteExpense } from "../controllers/expenseController.js";
import { setBudget } from "../controllers/budgetController.js";

const router = Router();

router.get("/dashboard",protect, getDashboard);

router.post("/expenses",protect, addExpense);
router.put("/expenses/:id",protect, updateExpense);
router.delete("/expenses/:id",protect, deleteExpense);

router.put("/budgets/:month",protect, setBudget);

export default router;
