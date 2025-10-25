/**
 * Article Model
 * In-memory storage for article tracking (read, favorites)
 * In production, this would be replaced with a database
 */

class Article {
  constructor() {
    // Store read articles by user: { userId: Set([articleIds]) }
    this.readArticles = new Map();
    // Store favorite articles with full data: { userId: Map(articleId => article) }
    this.favoriteArticles = new Map();
    // Store article metadata: { articleId: { url, title, ... } }
    this.articleMetadata = new Map();
  }

  /**
   * Generate article ID from URL
   * @param {string} url - Article URL
   * @returns {string} Article ID
   */
  generateArticleId(url) {
    // Simple hash function for URL (in production, use a proper hash)
    return Buffer.from(url).toString("base64").substring(0, 32);
  }

  /**
   * Store article metadata
   * @param {Object} article - Article data
   * @returns {string} Article ID
   */
  storeArticleMetadata(article) {
    const articleId = this.generateArticleId(article.url);

    if (!this.articleMetadata.has(articleId)) {
      this.articleMetadata.set(articleId, {
        id: articleId,
        url: article.url,
        title: article.title,
        description: article.description,
        content: article.content,
        image: article.image,
        publishedAt: article.publishedAt,
        source: article.source,
        cachedAt: new Date().toISOString(),
      });
    }

    return articleId;
  }

  /**
   * Get article metadata by ID
   * @param {string} articleId - Article ID
   * @returns {Object|null} Article metadata or null
   */
  getArticleMetadata(articleId) {
    return this.articleMetadata.get(articleId) || null;
  }

  /**
   * Mark article as read for user
   * @param {number} userId - User ID
   * @param {Object} article - Article data
   * @returns {Object} Result with articleId
   */
  markAsRead(userId, article) {
    // Store article metadata
    const articleId = this.storeArticleMetadata(article);

    // Initialize user's read set if not exists
    if (!this.readArticles.has(userId)) {
      this.readArticles.set(userId, new Set());
    }

    // Add to read set
    this.readArticles.get(userId).add(articleId);

    return {
      articleId,
      markedAt: new Date().toISOString(),
    };
  }

  /**
   * Mark article as read by ID (without storing metadata)
   * Use this when article metadata already exists
   * @param {number} userId - User ID
   * @param {string} articleId - Article ID
   * @returns {Object} Result with articleId and markedAt
   */
  markAsReadById(userId, articleId) {
    // Initialize user's read set if not exists
    if (!this.readArticles.has(userId)) {
      this.readArticles.set(userId, new Set());
    }

    // Add to read set
    this.readArticles.get(userId).add(articleId);

    return {
      articleId,
      markedAt: new Date().toISOString(),
    };
  }

  /**
   * Check if article is read by user
   * @param {number} userId - User ID
   * @param {string} articleId - Article ID
   * @returns {boolean} True if read
   */
  isRead(userId, articleId) {
    return (
      this.readArticles.has(userId) &&
      this.readArticles.get(userId).has(articleId)
    );
  }

  /**
   * Get all read articles for user
   * @param {number} userId - User ID
   * @returns {Array} Array of read articles with metadata
   */
  getReadArticles(userId) {
    if (!this.readArticles.has(userId)) {
      return [];
    }

    const readIds = Array.from(this.readArticles.get(userId));
    return readIds
      .map((id) => this.articleMetadata.get(id))
      .filter((article) => article !== undefined);
  }

  /**
   * Mark article as favorite for user
   * @param {number} userId - User ID
   * @param {Object} article - Article data
   * @returns {Object} Result with articleId
   */
  markAsFavorite(userId, article) {
    // Store article metadata
    const articleId = this.storeArticleMetadata(article);

    // Initialize user's favorites map if not exists
    if (!this.favoriteArticles.has(userId)) {
      this.favoriteArticles.set(userId, new Map());
    }

    // Add to favorites with timestamp
    this.favoriteArticles.get(userId).set(articleId, {
      ...this.articleMetadata.get(articleId),
      favoritedAt: new Date().toISOString(),
    });

    return {
      articleId,
      favoritedAt: new Date().toISOString(),
    };
  }

  /**
   * Mark article as favorite by ID (without storing metadata)
   * Use this when article metadata already exists
   * @param {number} userId - User ID
   * @param {string} articleId - Article ID
   * @returns {Object} Result with articleId and favoritedAt
   */
  markAsFavoriteById(userId, articleId) {
    // Check if article metadata exists
    const metadata = this.articleMetadata.get(articleId);

    // Initialize user's favorites map if not exists
    if (!this.favoriteArticles.has(userId)) {
      this.favoriteArticles.set(userId, new Map());
    }

    const favoritedAt = new Date().toISOString();

    // Add to favorites with timestamp
    if (metadata) {
      this.favoriteArticles.get(userId).set(articleId, {
        ...metadata,
        favoritedAt,
      });
    } else {
      // If no metadata exists, just store minimal info
      this.favoriteArticles.get(userId).set(articleId, {
        id: articleId,
        favoritedAt,
      });
    }

    return {
      articleId,
      favoritedAt,
    };
  }

  /**
   * Remove article from favorites
   * @param {number} userId - User ID
   * @param {string} articleId - Article ID
   * @returns {boolean} True if removed
   */
  removeFavorite(userId, articleId) {
    if (!this.favoriteArticles.has(userId)) {
      return false;
    }

    return this.favoriteArticles.get(userId).delete(articleId);
  }

  /**
   * Check if article is favorite by user
   * @param {number} userId - User ID
   * @param {string} articleId - Article ID
   * @returns {boolean} True if favorite
   */
  isFavorite(userId, articleId) {
    return (
      this.favoriteArticles.has(userId) &&
      this.favoriteArticles.get(userId).has(articleId)
    );
  }

  /**
   * Get all favorite articles for user
   * @param {number} userId - User ID
   * @returns {Array} Array of favorite articles
   */
  getFavoriteArticles(userId) {
    if (!this.favoriteArticles.has(userId)) {
      return [];
    }

    return Array.from(this.favoriteArticles.get(userId).values());
  }

  /**
   * Get statistics for user
   * @param {number} userId - User ID
   * @returns {Object} Statistics
   */
  getUserStats(userId) {
    const readCount = this.readArticles.has(userId)
      ? this.readArticles.get(userId).size
      : 0;

    const favoriteCount = this.favoriteArticles.has(userId)
      ? this.favoriteArticles.get(userId).size
      : 0;

    return {
      totalRead: readCount,
      totalFavorites: favoriteCount,
      totalArticlesTracked: this.articleMetadata.size,
    };
  }

  /**
   * Clear old article metadata (cleanup)
   * @param {number} maxAge - Maximum age in milliseconds
   */
  clearOldMetadata(maxAge = 7 * 24 * 60 * 60 * 1000) {
    // 7 days default
    const now = new Date();
    const toDelete = [];

    for (const [id, article] of this.articleMetadata.entries()) {
      const age = now - new Date(article.cachedAt);
      if (age > maxAge) {
        toDelete.push(id);
      }
    }

    // Don't delete if it's in someone's favorites
    for (const favMap of this.favoriteArticles.values()) {
      for (const id of favMap.keys()) {
        const index = toDelete.indexOf(id);
        if (index > -1) {
          toDelete.splice(index, 1);
        }
      }
    }

    toDelete.forEach((id) => this.articleMetadata.delete(id));

    return toDelete.length;
  }
}

// Export singleton instance
module.exports = new Article();
