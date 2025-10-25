const axios = require("axios");
const config = require("../config/config");
const cacheService = require("./cacheService");

/**
 * News Service - Handles all interactions with GNews API with caching
 */

class NewsService {
  constructor() {
    this.baseUrl = config.gnews.baseUrl;
    this.apiKey = config.gnews.apiKey;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Fetch news articles based on search query with caching
   * @param {string} query - Search query
   * @returns {Promise<Object>} News articles
   */
  async searchNews(query) {
    try {
      // Generate cache key
      const cacheKey = cacheService.generateKey("search", { query });

      // Check cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true,
        };
      }

      const params = {
        q: query,
        lang: "en",
        max: 10,
        apikey: this.apiKey,
      };

      const response = await axios.get(`${this.baseUrl}/search`, {
        params,
        timeout: 10000, // 10 second timeout
      });

      const result = {
        success: true,
        totalArticles: response.data.totalArticles,
        articles: response.data.articles,
      };

      // Store in cache
      await cacheService.set(cacheKey, result, this.cacheTTL);

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch news based on user preferences
   * @param {Array} preferences - User's news preferences
   * @returns {Promise<Object>} Personalized news articles
   */
  async getPersonalizedNews(preferences) {
    try {
      if (!preferences || preferences.length === 0) {
        return {
          success: true,
          totalArticles: 0,
          articles: [],
        };
      }

      // Fetch news for each preference and combine results
      const max = 10;
      const articlesPerPreference = Math.ceil(max / preferences.length);

      const newsPromises = preferences.map((preference) =>
        this.searchNews(preference).catch((err) => {
          console.error(`Error fetching news for ${preference}:`, err.message);
          return { success: true, articles: [] };
        })
      );

      const results = await Promise.all(newsPromises);

      // Combine and deduplicate articles
      const allArticles = [];
      const seenUrls = new Set();

      results.forEach((result) => {
        if (result.articles) {
          result.articles.forEach((article) => {
            if (!seenUrls.has(article.url)) {
              seenUrls.add(article.url);
              allArticles.push(article);
            }
          });
        }
      });

      // Limit to max articles
      const limitedArticles = allArticles.slice(0, max);

      return {
        success: true,
        totalArticles: limitedArticles.length,
        articles: limitedArticles,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors from GNews API
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // API responded with error
      const status = error.response.status;
      const message =
        error.response.data?.errors?.[0] ||
        error.response.data?.message ||
        "News API error";

      const err = new Error(message);
      err.status = status;
      err.isApiError = true;

      // Handle specific error cases
      switch (status) {
        case 400:
          err.message = "Invalid request to news API";
          break;
        case 401:
          err.message = "Invalid API key for news service";
          break;
        case 403:
          err.message = "Access forbidden to news API";
          break;
        case 429:
          err.message = "Rate limit exceeded for news API";
          break;
        case 500:
          err.message = "News API server error";
          break;
      }

      return err;
    } else if (error.request) {
      // Request was made but no response
      const err = new Error(
        "Unable to reach news API. Please try again later."
      );
      err.status = 503;
      err.isNetworkError = true;
      return err;
    } else {
      // Other errors
      const err = new Error(error.message || "Failed to fetch news");
      err.status = 500;
      return err;
    }
  }

  /**
   * Validate API key
   * @returns {boolean} Whether API key is configured
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey !== "your_gnews_api_key_here";
  }

  /**
   * Clear all news cache
   */
  async clearCache() {
    await cacheService.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Set cache TTL
   * @param {number} ttl - Time to live in milliseconds
   */
  setCacheTTL(ttl) {
    this.cacheTTL = ttl;
  }
}

// Export singleton instance
module.exports = new NewsService();
