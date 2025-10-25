/**
 * Cache Service
 * In-memory caching for news articles with TTL (Time To Live)
 * In production, this would be replaced with Redis or similar
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // Default TTL: 5 minutes in milliseconds
  }

  /**
   * Generate cache key from parameters
   * @param {string} prefix - Cache key prefix
   * @param {Object} params - Parameters to include in key
   * @returns {string} Cache key
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join("|");
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Set cache entry with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  async set(key, value, ttl = this.ttl) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt,
      cachedAt: new Date().toISOString(),
    });
  }

  /**
   * Get cache entry
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if expired/not found
   */
  async get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if exists and valid
   */
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   * @returns {boolean} True if deleted
   */
  async delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear() {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  async clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    let expired = 0;
    let valid = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      ttl: this.ttl,
    };
  }

  /**
   * Get all cache keys
   * @returns {Array} Array of cache keys
   */
  getKeys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Set default TTL
   * @param {number} ttl - Time to live in milliseconds
   */
  setDefaultTTL(ttl) {
    this.ttl = ttl;
  }
}

// Export singleton instance
module.exports = new CacheService();
