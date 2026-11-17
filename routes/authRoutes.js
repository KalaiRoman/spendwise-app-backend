import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  signup, login, me, changePassword, forgotPassword, resetPassword,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/me", protect, me);
router.put("/change-password", protect, changePassword);

export default router;
