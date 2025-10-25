'use strict';

const redisService = require('./redis.service');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const crypto = require('crypto');

class RegistrationSessionService {
  constructor() {
    this.SESSION_TTL = 30 * 60; // 30 minutes in seconds
    this.SESSION_PREFIX = 'reg_session:';
  }

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create a new registration session
   * @param {string} contact - Email or phone number
   * @param {string} type - 'email' or 'phone'
   * @returns {Promise<string>} Session ID
   */
  async createSession(contact, type) {
    const sessionId = this.generateSessionId();
    const key = this.SESSION_PREFIX + sessionId;

    await redisService.set(key, {
      contact,
      type,
      step: 'initiated',
      verified: false,
      createdAt: Date.now()
    }, this.SESSION_TTL);

    return sessionId;
  }

  /**
   * Get registration session data
   * @param {string} sessionId - Session ID
   * @returns {Promise<object|null>} Session data
   */
  async getSession(sessionId) {
    const key = this.SESSION_PREFIX + sessionId;
    const session = await redisService.get(key);
    
    if (!session) {
      throw new NotFoundError('Registration session expired or not found');
    }

    return session;
  }

  /**
   * Update registration session data
   * @param {string} sessionId - Session ID
   * @param {object} data - Data to update
   */
  async updateSession(sessionId, data) {
    const key = this.SESSION_PREFIX + sessionId;
    const session = await this.getSession(sessionId);
    
    // Merge existing data with new data
    const updatedData = {
      ...session,
      ...data,
      updatedAt: Date.now()
    };

    await redisService.set(key, updatedData, this.SESSION_TTL);
    return updatedData;
  }

  /**
   * Mark session as verified
   * @param {string} sessionId - Session ID
   */
  async markAsVerified(sessionId) {
    await this.updateSession(sessionId, {
      verified: true,
      step: 'verified',
      verifiedAt: Date.now()
    });
  }

  /**
   * Complete registration session
   * @param {string} sessionId - Session ID
   * @param {object} userData - User data (fullName, password)
   */
  async completeSession(sessionId, userData) {
    const session = await this.getSession(sessionId);
    
    if (!session.verified) {
      throw new BadRequestError('Contact must be verified before completing registration');
    }

    await this.updateSession(sessionId, {
      ...userData,
      step: 'completed',
      completedAt: Date.now()
    });
  }

  /**
   * Delete registration session
   * @param {string} sessionId - Session ID
   */
  async deleteSession(sessionId) {
    const key = this.SESSION_PREFIX + sessionId;
    await redisService.delete(key);
  }

  /**
   * Check if a session exists and is valid
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} Whether session exists and is valid
   */
  async isValidSession(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      return !!session;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new RegistrationSessionService();