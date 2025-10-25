const newsService = require("../services/newsService");
const UserModel = require("../models/User");
const { validateSearchQuery, sanitizeInput } = require("../utils/validation");

/**
 * Get personalized news for authenticated user
 * GET /api/v1/news
 */
const getNews = async (req, res) => {
  try {
    // Check if news API is configured
    if (!newsService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          "News service is not configured. Please contact administrator.",
      });
    }

    // Get user from authenticated request
    const user = UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has preferences set
    if (!user.preferences || user.preferences.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No preferences set. Please set your preferences first using PUT /api/v1/users/preferences",
      });
    }

    // Fetch personalized news based on user preferences
    const newsData = await newsService.getPersonalizedNews(user.preferences);

    res.status(200).json({
      success: true,
      message: "News fetched successfully",
      fromCache: newsData.fromCache || false,
      data: {
        preferences: user.preferences,
        totalArticles: newsData.totalArticles,
        articles: newsData.articles.map((article) => ({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt,
          source: {
            name: article.source.name,
            url: article.source.url,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Get news error:", error);

    // Handle specific error types
    if (error.isApiError) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
        error: "News API error",
      });
    }

    if (error.isNetworkError) {
      return res.status(503).json({
        success: false,
        message: error.message,
        error: "Network error",
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching news",
      error: error.message,
    });
  }
};

/**
 * Search news articles
 * GET /api/v1/news/search
 */
const searchNews = async (req, res) => {
  try {
    // Check if news API is configured
    if (!newsService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          "News service is not configured. Please contact administrator.",
      });
    }

    const { q } = req.query;

    // Validate search query
    const queryValidation = validateSearchQuery(q);
    if (!queryValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid search query",
        errors: queryValidation.errors,
      });
    }

    const sanitizedQuery = sanitizeInput(q);

    // Search news
    const newsData = await newsService.searchNews(sanitizedQuery);

    res.status(200).json({
      success: true,
      message: "News search completed successfully",
      fromCache: newsData.fromCache || false,
      data: {
        query: sanitizedQuery,
        totalArticles: newsData.totalArticles,
        articles: newsData.articles.map((article) => ({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt,
          source: {
            name: article.source.name,
            url: article.source.url,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Search news error:", error);

    // Handle specific error types
    if (error.isApiError) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
        error: "News API error",
      });
    }

    if (error.isNetworkError) {
      return res.status(503).json({
        success: false,
        message: error.message,
        error: "Network error",
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred while searching news",
      error: error.message,
    });
  }
};

module.exports = {
  getNews,
  searchNews,
};
