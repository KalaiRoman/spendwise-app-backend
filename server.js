import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";
const app = express();
app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000"],credentials:true }));
app.use(express.json());
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error("DB connection failed:", err.message); process.exit(1); });
