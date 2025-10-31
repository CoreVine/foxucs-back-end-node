const db = require('../../models');
const BaseRepository = require('../base.repository');
const { Op } = require("sequelize");
const crypto = require('crypto');
const { DatabaseError } = require('../../utils/errors/types/Sequelize.error');

class VerificationCodeRepository extends BaseRepository {
  constructor() {
    super(db.VerificationCode);
  }

  /**
   * Find a verification code by email and type
   * @param {String} email - The user's email
   * @param {String} type - The verification type
   * @returns {Promise<Object>} The found verification code
   */
  async findByEmailAndType(email, type = 'password_reset') {
    try {
      return await this.model.findOne({
        where: { 
          email,
          type
        }
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Find a valid verification code by email, code, and type
   * @param {String} email - The user's email
   * @param {String} code - The verification code
   * @param {String} type - The verification type
   * @returns {Promise<Object>} The found verification code
   */
  async findActiveCode({ email, phone, type, verified = false }) {
    try {
      return await this.model.findOne({
        where: {
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          type,
          verified,
          expires_at: { [Op.gt]: new Date() }
        },
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Update verification code to mark it as verified
   * @param {Number} id - The verification code ID
   * @returns {Promise<Object>} The updated verification code
   */
  async markAsVerified(id) {
    try {
      return await this.model.update(
        { verified: true },
        { where: { id } }
      );
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Find a verified code by email and type
   * @param {String} email - The user's email
   * @param {String} type - The verification type
   * @returns {Promise<Object>} The found verification code
   */
  async findVerifiedCode(email, type = 'password_reset') {
    try {
      return await this.model.findOne({
        where: { 
          email,
          type,
          verified: true,
          expires_at: { [Op.gt]: new Date() }
        }
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Delete expired verification codes
   * @param {String} email - Optional email to filter by
   * @returns {Promise<Number>} The number of deleted codes
   */
  async deleteExpired(email = null) {
    try {
      const whereCondition = {
        expires_at: { [Op.lt]: new Date() }
      };
      
      if (email) {
        whereCondition.email = email;
      }
      
      return await this.model.destroy({
        where: whereCondition
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Delete verification codes by email and type
   * @param {String} email - The user's email
   * @param {String} type - The verification type
   * @returns {Promise<Number>} The number of deleted codes
   */
  async deleteByEmailAndType(email, type = 'password_reset') {
    try {
      return await this.model.destroy({
        where: { email, type }
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Delete used verification codes
   * @param {String} email - Optional email to filter by
   * @returns {Promise<Number>} The number of deleted codes
   */
  async deleteUsedTokens(email = null) {
    try {
      const whereCondition = {
        token_used: true
      };
      
      if (email) {
        whereCondition.email = email;
      }
      
      return await this.model.destroy({
        where: whereCondition
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Perform complete cleanup (delete expired and used tokens)
   * @param {String} email - Optional email to filter by
   * @returns {Promise<Number>} The total number of deleted codes
   */
  async cleanupTokens(email = null) {
    try {
      const expiredDeleted = await this.deleteExpired(email);
      const usedDeleted = await this.deleteUsedTokens(email);
      return expiredDeleted + usedDeleted;
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Generate a reset token and store it with the verification code
   * @param {Number} id - The verification code ID
   * @returns {Promise<String>} The generated reset token
   */
  async generateResetToken(id) {
    try {
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Update the verification code with the token
      await this.model.update(
        { 
          reset_token: resetToken,
          token_used: false
        },
        { where: { id } }
      );
      
      return resetToken;
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Find and validate a verification code by email and reset token
   * @param {String} email - The user's email
   * @param {String} resetToken - The reset token
   * @returns {Promise<Object>} The found verification code
   */
  async findByResetToken(email, resetToken) {
    try {
      return await this.model.findOne({
        where: { 
          email,
          reset_token: resetToken,
          verified: true,
          token_used: false,
          expires_at: { [Op.gt]: new Date() }
        }
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Increment attempt counter for verification code
   * @param {String} email - The user's email
   * @param {String} type - The verification type
   * @returns {Promise<Object>} The updated verification code
   */
  async incrementAttempt(email, type = 'password_reset') {
    try {
      const verificationCode = await this.findByEmailAndType(email, type);
      if (!verificationCode) return null;
      
      return await this.model.update(
        { attempt_count: verificationCode.attempt_count + 1 },
        { where: { id: verificationCode.id } }
      );
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  /**
   * Mark a reset token as used
   * @param {Number} id - The verification code ID
   * @returns {Promise<Object>} The update result
   */
  async markTokenAsUsed(id) {
    try {
      return await this.model.update(
        { token_used: true },
        { where: { id } }
      );
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

/**
 * Create registration verification code
 * @param {Object} data - { email or phone, verify_type }
 */
async createRegistrationCode(data) {
  try {
    // Delete any existing unverified registration codes
    await this.model.destroy({
      where: {
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        type: 'registration',
        verify_type: data.verify_type,
        verified: false
      }
    });

    return await this.model.create({
      ...data,
      type: 'registration',
      code:111111, //Math.floor(100000 + Math.random() * 900000).toString(),
      expires_at: new Date(Date.now() + (30 * 60 * 1000)), // 30 minutes
      attempt_count: 0
    });
  } catch (error) {
    throw new DatabaseError(error);
  }
}
/**
 * Verify registration code
 * @param {Object} data - { email or phone, code, verify_type }
 */
async verifyRegistrationCode(data) {
  try {
    const verificationCode = await this.model.findOne({
      where: {
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        code: data.code,
        type: 'registration',
        verify_type: data.verify_type,
        verified: false,
        expires_at: { [Op.gt]: new Date() },
        attempt_count: { [Op.lt]: 5 }
      }
    });

    if (!verificationCode) {
      return null;
    }

    await verificationCode.update({
      verified: true,
      updated_at: new Date()
    });

    return verificationCode;
  } catch (error) {
    throw new DatabaseError(error);
  }
}

/**
 * Find existing active registration code
 * @param {Object} data - { email or phone, verify_type }
 */
async findActiveRegistrationCode(data) {
  try {
    return await this.model.findOne({
      where: {
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        type: 'registration',
        verify_type: data.verify_type,
        verified: false,
        expires_at: { [Op.gt]: new Date() },
        attempt_count: { [Op.lt]: 5 }
      }
    });
  } catch (error) {
    throw new DatabaseError(error);
  }
}

/**
 * Mark a reset token as used and then delete it
 * @param {Number} id - The verification code ID
 * @returns {Promise<Object>} The deletion result
 */
  async markUsedAndDelete(id) {
    try {
      // First mark as used (for tracking/audit purposes if needed)
      await this.model.update(
        { token_used: true },
        { where: { id } }
      );
      
      // Then immediately delete it
      return await this.model.destroy({
        where: { id }
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }
}

module.exports = VerificationCodeRepository;
