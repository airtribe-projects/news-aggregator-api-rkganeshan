const {
  validateRegistration,
  validateLogin,
  validatePreferences,
  validateSearchQuery,
} = require("../utils/validation");

/**
 * Middleware to validate registration data
 */
const validateRegistrationMiddleware = (req, res, next) => {
  const validation = validateRegistration(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

/**
 * Middleware to validate login data
 */
const validateLoginMiddleware = (req, res, next) => {
  const validation = validateLogin(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

/**
 * Middleware to validate preferences data
 */
const validatePreferencesMiddleware = (req, res, next) => {
  const validation = validatePreferences(req.body.preferences);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

/**
 * Middleware to validate search query
 */
const validateSearchQueryMiddleware = (req, res, next) => {
  const validation = validateSearchQuery(req.query.q);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid search query",
      errors: validation.errors,
    });
  }

  next();
};

/**
 * Middleware to validate request body is not empty
 */
const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Request body is required",
    });
  }
  next();
};

/**
 * Middleware to validate Content-Type header for JSON requests
 */
const validateContentType = (req, res, next) => {
  // Only check for POST, PUT, PATCH requests
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.get("Content-Type");

    if (!contentType || !contentType.includes("application/json")) {
      return res.status(415).json({
        success: false,
        message: "Content-Type must be application/json",
        error: "UNSUPPORTED_MEDIA_TYPE",
      });
    }
  }
  next();
};

module.exports = {
  validateRegistrationMiddleware,
  validateLoginMiddleware,
  validatePreferencesMiddleware,
  validateSearchQueryMiddleware,
  validateRequestBody,
  validateContentType,
};
