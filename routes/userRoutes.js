const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const preferencesController = require("../controllers/preferencesController");

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get("/profile", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      user: req.user,
    },
  });
});

/**
 * @route   GET /api/v1/users/preferences
 * @desc    Get user preferences
 * @access  Private (requires authentication)
 */
router.get("/preferences", authenticate, preferencesController.getPreferences);

/**
 * @route   PUT /api/v1/users/preferences
 * @desc    Update user preferences
 * @access  Private (requires authentication)
 */
router.put(
  "/preferences",
  authenticate,
  preferencesController.updatePreferences
);

module.exports = router;
