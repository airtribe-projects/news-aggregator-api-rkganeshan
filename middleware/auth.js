const { verifyToken } = require("../utils/jwt");
const UserModel = require("../models/User");

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
        error: "MISSING_TOKEN",
      });
    }

    // Check if token format is correct (Bearer <token>)
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Expected format: 'Bearer <token>'",
        error: "INVALID_TOKEN_FORMAT",
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is empty
    if (!token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Token is empty.",
        error: "EMPTY_TOKEN",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (verifyError) {
      // Handle specific JWT errors
      if (verifyError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
          error: "TOKEN_EXPIRED",
        });
      }
      if (verifyError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please login again.",
          error: "INVALID_TOKEN",
        });
      }
      throw verifyError; // Re-throw unexpected errors
    }

    // Validate decoded token has required fields
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload. Please login again.",
        error: "INVALID_TOKEN_PAYLOAD",
      });
    }

    // Find user
    const user = UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token may be invalid or user was deleted.",
        error: "USER_NOT_FOUND",
      });
    }

    // Attach user to request (exclude password)
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please try again.",
      error: error.message || "AUTHENTICATION_ERROR",
    });
  }
};

module.exports = {
  authenticate,
};
