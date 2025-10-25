const UserModel = require("../models/User");
const { validatePreferences } = require("../utils/validation");

/**
 * Get user preferences
 * GET /api/v1/users/preferences
 */
const getPreferences = async (req, res) => {
  try {
    // req.user is attached by authentication middleware
    const user = UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferences retrieved successfully",
      data: {
        preferences: user.preferences || [],
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching preferences",
      error: error.message,
    });
  }
};

/**
 * Update user preferences
 * PUT /api/v1/users/preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    // Validate preferences using enhanced validation
    const validation = validatePreferences(preferences);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Trim and normalize preferences
    const normalizedPreferences = preferences
      .map((pref) => pref.trim().toLowerCase())
      .filter((pref) => pref.length > 0); // Remove empty strings after trim

    // Remove duplicates
    const uniquePreferences = [...new Set(normalizedPreferences)];

    // Additional validation: ensure we have at least some preferences after normalization
    if (uniquePreferences.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid preference is required",
      });
    }

    // Update user preferences
    const updatedUser = UserModel.update(req.user.id, {
      preferences: uniquePreferences,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: {
        preferences: updatedUser.preferences,
      },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating preferences",
      error: error.message,
    });
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
};
