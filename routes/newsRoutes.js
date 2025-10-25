const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const newsController = require("../controllers/newsController");
const articleController = require("../controllers/articleController");

/**
 * @route   GET /api/v1/news
 * @desc    Get personalized news based on user preferences
 * @access  Private (requires authentication)
 */
router.get("/", authenticate, newsController.getNews);

/**
 * @route   GET /api/v1/news/search
 * @desc    Search news articles
 * @access  Private (requires authentication)
 */
router.get("/search", authenticate, newsController.searchNews);

/**
 * @route   GET /api/v1/news/read
 * @desc    Get all read articles
 * @access  Private (requires authentication)
 */
router.get("/read", authenticate, articleController.getReadArticles);

/**
 * @route   POST /api/v1/news/:id/read
 * @desc    Mark article as read
 * @access  Private (requires authentication)
 */
router.post("/:id/read", authenticate, articleController.markAsRead);

/**
 * @route   GET /api/v1/news/favorites
 * @desc    Get all favorite articles
 * @access  Private (requires authentication)
 */
router.get("/favorites", authenticate, articleController.getFavoriteArticles);

/**
 * @route   POST /api/v1/news/:id/favorite
 * @desc    Mark article as favorite
 * @access  Private (requires authentication)
 */
router.post("/:id/favorite", authenticate, articleController.markAsFavorite);

/**
 * @route   DELETE /api/v1/news/:id/favorite
 * @desc    Remove article from favorites
 * @access  Private (requires authentication)
 */
router.delete("/:id/favorite", authenticate, articleController.removeFavorite);

/**
 * @route   GET /api/v1/news/stats
 * @desc    Get article statistics for user
 * @access  Private (requires authentication)
 */
router.get("/stats", authenticate, articleController.getArticleStats);

module.exports = router;
