import crypto from "crypto";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendAuth = (res, user, status = 200) =>
  res.status(status).json({
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email },
  });

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "Enter a valid email." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: "This email is already registered." });
    }
    const user = await User.create({ name, email, password });
    sendAuth(res, user, 201);
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    sendAuth(res, user);
  } catch (err) { next(err); }
};

export const me = (req, res) => res.json({ user: req.user });

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both passwords are required." });
    if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters." });
    if (newPassword === currentPassword) return res.status(400).json({ message: "New password must be different." });

    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.checkPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is wrong." });
    }
    user.password = newPassword;         
    user.passwordChangedAt = new Date();  
    await user.save();
    sendAuth(res, user);                 
  } catch (err) { next(err); }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
    if (user) {
      const raw = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = sha256(raw);                             
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); 
      await user.save({ validateBeforeSave: false });

      const link = `${process.env.CLIENT_URL}/reset-password/${raw}`;
      console.log("Password reset link:", link);
    }
    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

    const user = await User.findOne({
      resetPasswordToken: sha256(req.params.token),
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password");
    if (!user) return res.status(400).json({ message: "Reset link is invalid or has expired." });

    user.password = password;
    user.passwordChangedAt = new Date();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    sendAuth(res, user);
  } catch (err) { next(err); }
};
