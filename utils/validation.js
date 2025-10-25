/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * Minimum 6 characters, at least one letter and one number (enhanced)
 * @param {string} password - Password to validate
 * @param {boolean} strict - If true, requires at least one letter and one number
 * @returns {boolean} True if valid
 */
const isValidPassword = (password, strict = false) => {
  if (!password || typeof password !== "string") return false;

  if (strict) {
    // Must be at least 8 chars with letter and number
    return (
      password.length >= 8 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }

  // Basic: at least 6 characters
  return password.length >= 6;
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 */
const isValidName = (name) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Validate preferences array
 * @param {Array} preferences - Preferences to validate
 * @returns {Object} Validation result {isValid, errors}
 */
const validatePreferences = (preferences) => {
  const errors = [];

  if (preferences === undefined || preferences === null) {
    errors.push("Preferences are required");
    return { isValid: false, errors };
  }

  if (!Array.isArray(preferences)) {
    errors.push("Preferences must be an array");
    return { isValid: false, errors };
  }

  if (preferences.length > 50) {
    errors.push("Maximum 50 preferences allowed");
  }

  // Validate each preference
  preferences.forEach((pref, index) => {
    if (typeof pref !== "string") {
      errors.push(`Preference at index ${index} must be a string`);
    } else if (pref.trim() === "") {
      errors.push(`Preference at index ${index} cannot be empty`);
    } else if (pref.length > 100) {
      errors.push(
        `Preference at index ${index} exceeds maximum length of 100 characters`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate search query
 * @param {string} query - Search query
 * @returns {Object} Validation result {isValid, errors}
 */
const validateSearchQuery = (query) => {
  const errors = [];

  if (!query || typeof query !== "string") {
    errors.push("Search query is required and must be a string");
  } else if (query.trim() === "") {
    errors.push("Search query cannot be empty");
  } else if (query.trim().length < 2) {
    errors.push("Search query must be at least 2 characters");
  } else if (query.length > 500) {
    errors.push("Search query exceeds maximum length of 500 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate registration input
 * @param {Object} data - Registration data
 * @returns {Object} Validation result {isValid, errors}
 */
const validateRegistration = (data) => {
  const errors = [];

  // Validate email
  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(data.email)) {
    errors.push("Invalid email format");
  }

  // Validate password
  if (!data.password) {
    errors.push("Password is required");
  } else if (!isValidPassword(data.password)) {
    errors.push("Password must be at least 6 characters long");
  }

  // Validate name
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("Name is required");
  } else if (!isValidName(data.name)) {
    errors.push("Name must be between 2 and 100 characters");
  }

  // Validate preferences if provided
  if (data.preferences !== undefined) {
    const prefValidation = validatePreferences(data.preferences);
    if (!prefValidation.isValid) {
      errors.push(...prefValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate login input
 * @param {Object} data - Login data
 * @returns {Object} Validation result {isValid, errors}
 */
const validateLogin = (data) => {
  const errors = [];

  // Validate email
  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(data.email)) {
    errors.push("Invalid email format");
  }

  // Validate password
  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required");
  } else if (data.password.length === 0) {
    errors.push("Password cannot be empty");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Remove potential script tags and dangerous characters
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .substring(0, 1000); // Limit length
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  validateRegistration,
  validateLogin,
  validatePreferences,
  validateSearchQuery,
  sanitizeInput,
};
