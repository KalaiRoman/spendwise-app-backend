import jwt from "jsonwebtoken";

// Creates the login token (JWT) the frontend stores and sends back on every request
export const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
