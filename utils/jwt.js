const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
    return token;
  } catch (error) {
    throw new Error("Error generating token");
  }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
