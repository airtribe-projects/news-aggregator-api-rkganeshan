const newsService = require("./newsService");
const cacheService = require("./cacheService");
const UserModel = require("../models/User");
const ArticleModel = require("../models/Article");

/**
 * Background Job Service
 * Handles periodic cache updates and cleanup tasks
 */

class BackgroundJobService {
  constructor() {
    this.intervals = {
      cacheUpdate: null,
      cacheCleanup: null,
      articleCleanup: null,
    };
    this.isRunning = false;
  }

  /**
   * Start all background jobs
   * @param {Object} config - Job configuration
   */
  start(config = {}) {
    if (this.isRunning) {
      console.log("Background jobs already running");
      return;
    }

    const {
      cacheUpdateInterval = 5 * 60 * 1000, // 5 minutes
      cacheCleanupInterval = 10 * 60 * 1000, // 10 minutes
      articleCleanupInterval = 60 * 60 * 1000, // 1 hour
    } = config;

    console.log("Starting background jobs...");

    // Periodic cache update for popular categories
    this.intervals.cacheUpdate = setInterval(async () => {
      await this.updatePopularNewsCache();
    }, cacheUpdateInterval);

    // Periodic cache cleanup (remove expired entries)
    this.intervals.cacheCleanup = setInterval(async () => {
      await this.cleanupCache();
    }, cacheCleanupInterval);

    // Periodic article metadata cleanup
    this.intervals.articleCleanup = setInterval(async () => {
      await this.cleanupOldArticles();
    }, articleCleanupInterval);

    this.isRunning = true;
    console.log("Background jobs started successfully");
  }

  /**
   * Stop all background jobs
   */
  stop() {
    if (!this.isRunning) {
      console.log("Background jobs not running");
      return;
    }

    console.log("Stopping background jobs...");

    Object.keys(this.intervals).forEach((key) => {
      if (this.intervals[key]) {
        clearInterval(this.intervals[key]);
        this.intervals[key] = null;
      }
    });

    this.isRunning = false;
    console.log("Background jobs stopped successfully");
  }

  /**
   * Update cache for active users' personalized news
   */
  async updatePopularNewsCache() {
    try {
      console.log("[Background Job] Updating user personalized news cache...");

      // Update cache for active users' preferences
      await this.updateUserPreferencesCache();

      console.log("[Background Job] User news cache updated successfully");
    } catch (error) {
      console.error("[Background Job] Error in updatePopularNewsCache:", error);
    }
  }

  /**
   * Update cache for active users' preferences
   */
  async updateUserPreferencesCache() {
    try {
      const users = UserModel.findAll();

      // Limit to first 10 active users to avoid overwhelming the API
      const activeUsers = users.slice(0, 10);

      for (const user of activeUsers) {
        if (user.preferences && user.preferences.length > 0) {
          try {
            await newsService.getPersonalizedNews(user.preferences);
          } catch (error) {
            console.error(
              `[Background Job] Error updating cache for user ${user.id}:`,
              error.message
            );
          }
        }
      }

      console.log(
        `[Background Job] Updated cache for ${activeUsers.length} active users`
      );
    } catch (error) {
      console.error(
        "[Background Job] Error in updateUserPreferencesCache:",
        error
      );
    }
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanupCache() {
    try {
      console.log("[Background Job] Cleaning up expired cache entries...");

      await cacheService.clearExpired();

      const stats = cacheService.getStats();
      console.log(`[Background Job] Cache cleanup completed. Stats:`, stats);
    } catch (error) {
      console.error("[Background Job] Error in cleanupCache:", error);
    }
  }

  /**
   * Cleanup old article metadata
   */
  async cleanupOldArticles() {
    try {
      console.log("[Background Job] Cleaning up old article metadata...");

      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      const deletedCount = ArticleModel.clearOldMetadata(maxAge);

      console.log(
        `[Background Job] Deleted ${deletedCount} old article metadata entries`
      );
    } catch (error) {
      console.error("[Background Job] Error in cleanupOldArticles:", error);
    }
  }

  /**
   * Force update cache immediately
   */
  async forceUpdateCache() {
    console.log("[Background Job] Force updating cache...");
    await this.updatePopularNewsCache();
    await this.cleanupCache();
    console.log("[Background Job] Force update completed");
  }

  /**
   * Get job status
   * @returns {Object} Job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: {
        cacheUpdate: !!this.intervals.cacheUpdate,
        cacheCleanup: !!this.intervals.cacheCleanup,
        articleCleanup: !!this.intervals.articleCleanup,
      },
      cacheStats: cacheService.getStats(),
    };
  }
}

// Export singleton instance
module.exports = new BackgroundJobService();
