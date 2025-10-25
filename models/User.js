/**
 * User Model
 * In-memory storage for users (using array for simplicity)
 * In production, this would be replaced with a database
 */

class User {
  constructor() {
    this.users = [];
    this.currentId = 1;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data (email, password, name)
   * @returns {Object} Created user
   */
  create(userData) {
    const user = {
      id: this.currentId++,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      preferences: userData.preferences || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  findByEmail(email) {
    return this.users.find((user) => user.email === email) || null;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Object|null} User object or null
   */
  findById(id) {
    return this.users.find((user) => user.id === id) || null;
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object|null} Updated user or null
   */
  update(id, updateData) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return null;
    }
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return this.users[userIndex];
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {boolean} Success status
   */
  delete(id) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return false;
    }
    this.users.splice(userIndex, 1);
    return true;
  }

  /**
   * Get all users
   * @returns {Array} Array of users
   */
  findAll() {
    return this.users;
  }
}

// Export singleton instance
module.exports = new User();
