/**
 * Custom Error Classes
 */
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.errors = errors;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
  }
}

class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "ServiceUnavailableError";
    this.statusCode = 503;
  }
}

/**
 * Global error handling middleware
 * This should be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error occurred:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  // Default error response
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || undefined;

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message || "Validation failed";
    errors = err.errors;
  } else if (
    err.name === "AuthenticationError" ||
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    statusCode = 401;
    message = err.message || "Authentication failed";
  } else if (err.name === "AuthorizationError") {
    statusCode = 403;
    message = err.message || "Access forbidden";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = err.message || "Resource not found";
  } else if (err.name === "ConflictError") {
    statusCode = 409;
    message = err.message || "Resource conflict";
  } else if (err.name === "ServiceUnavailableError" || err.isNetworkError) {
    statusCode = 503;
    message = err.message || "Service temporarily unavailable";
  } else if (err.isApiError) {
    statusCode = err.status || 500;
    message = err.message || "External API error";
  }

  // Construct error response
  const errorResponse = {
    success: false,
    message,
  };

  // Add errors array if present
  if (errors && errors.length > 0) {
    errorResponse.errors = errors;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * This should be placed before the error handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    error: "ROUTE_NOT_FOUND",
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  // Export custom error classes
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
};
