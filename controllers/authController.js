const UserModel = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const { validateRegistration, validateLogin } = require("../utils/validation");

/**
 * Register a new user
 * POST /register
 */
const register = async (req, res) => {
  try {
    const { email, password, name, preferences } = req.body;

    // Validate input
    const validation = validateRegistration({ email, password, name });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if user already exists
    const existingUser = UserModel.findByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = UserModel.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      preferences: preferences || [],
    });

    // Return success response (exclude password)
    // Note: User must login separately to receive JWT token
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please login to continue.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};

/**
 * Login user
 * POST /login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Find user by email
    const user = UserModel.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};
