const ArticleModel = require("../models/Article");

/**
 * Mark article as read
 * POST /api/v1/news/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Mark as read using just the article ID
    const result = ArticleModel.markAsReadById(req.user.id, id);

    res.status(200).json({
      success: true,
      message: "Article marked as read",
      data: {
        articleId: result.articleId,
        markedAt: result.markedAt,
      },
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while marking article as read",
      error: error.message,
    });
  }
};

/**
 * Get all read articles
 * GET /api/v1/news/read
 */
const getReadArticles = async (req, res) => {
  try {
    const readArticles = ArticleModel.getReadArticles(req.user.id);

    res.status(200).json({
      success: true,
      message: "Read articles retrieved successfully",
      data: {
        totalRead: readArticles.length,
        articles: readArticles,
      },
    });
  } catch (error) {
    console.error("Get read articles error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching read articles",
      error: error.message,
    });
  }
};

/**
 * Mark article as favorite
 * POST /api/v1/news/:id/favorite
 */
const markAsFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    // Mark as favorite using just the article ID
    const result = ArticleModel.markAsFavoriteById(req.user.id, id);

    res.status(200).json({
      success: true,
      message: "Article marked as favorite",
      data: {
        articleId: result.articleId,
        favoritedAt: result.favoritedAt,
      },
    });
  } catch (error) {
    console.error("Mark as favorite error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while marking article as favorite",
      error: error.message,
    });
  }
};

/**
 * Remove article from favorites
 * DELETE /api/v1/news/:id/favorite
 */
const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const removed = ArticleModel.removeFavorite(req.user.id, id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Article not found in favorites",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while removing article from favorites",
      error: error.message,
    });
  }
};

/**
 * Get all favorite articles
 * GET /api/v1/news/favorites
 */
const getFavoriteArticles = async (req, res) => {
  try {
    const favoriteArticles = ArticleModel.getFavoriteArticles(req.user.id);

    res.status(200).json({
      success: true,
      message: "Favorite articles retrieved successfully",
      data: {
        totalFavorites: favoriteArticles.length,
        articles: favoriteArticles,
      },
    });
  } catch (error) {
    console.error("Get favorite articles error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching favorite articles",
      error: error.message,
    });
  }
};

/**
 * Get article statistics for user
 * GET /api/v1/news/stats
 */
const getArticleStats = async (req, res) => {
  try {
    const stats = ArticleModel.getUserStats(req.user.id);

    res.status(200).json({
      success: true,
      message: "Article statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Get article stats error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching article statistics",
      error: error.message,
    });
  }
};

module.exports = {
  markAsRead,
  getReadArticles,
  markAsFavorite,
  removeFavorite,
  getFavoriteArticles,
  getArticleStats,
};
