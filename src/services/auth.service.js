"use strict";

const { Op } = require("sequelize");
const UserRepository = require("../data-access/users");
const VerificationCodeRepository = require("../data-access/verificationCodes");
const jwtService = require("../infrastructure/jwt.service");
const emailService = require("../infrastructure/email.service");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");
const bcrypt = require("bcryptjs");
const SocialLoginRepository = require('../data-access/socialLogins');
const ProfileRepository = require('../data-access/profiles');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.verificationCodeRepository = new VerificationCodeRepository();
  }

  async createSession(user) {
    const token = jwtService.generateToken(user);
    return { token };
  }

  async sendVerificationCode({ sessionId, type, contact, purpose }) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmailOrPhone(
      type === "email" ? contact : null,
      type === "phone" ? contact : null
    );

    if (existingUser) {
      throw new BadRequestError("User already exists");
    }

    // Generate verification code
    const verificationCode =
      await this.verificationCodeRepository.createRegistrationCode({
        email: type === "email" ? contact : null,
        phone: type === "phone" ? contact : null,
        verify_type: type,
      });

    // Send verification code
    if (type === "email") {
      await emailService.sendAccountVerificationCode(contact, {
        verificationCode: verificationCode.code,
        email: contact,
        name: contact.split("@")[0], // Use part before @ as name
      });
    } else {
      // Pick provider based on environment. Default to Twilio service
      const provider = (process.env.SMS_PROVIDER || "twilio").toLowerCase();
      const servicePath =
        provider === "twilio" ? "./twilio.service" : "./sms.Service";
      const smsService = require(servicePath);

      // Initialize SMS service if not already initialized
      if (!global.smsServiceInitialized) {
        await smsService.init();
        global.smsServiceInitialized = true;
      }

      try {
        // Send the verification code via selected SMS provider (the code is already stored in DB)
        await smsService.sendVerificationCodeSms(
          contact,
          verificationCode.code
        );
      } catch (err) {
        // If sending fails, remove the verification code record to avoid orphaned codes
        const logger = require("../infrastructure/logging.service").getLogger();
        logger.error("[Auth] Failed to send verification SMS", {
          message: err.message,
          contact,
          provider,
        });
        await this.verificationCodeRepository
          .delete(verificationCode.id)
          .catch(() => {});
        throw new Error("Failed to send verification code via SMS");
      }
    }

    return {
      message: `Verification code sent to your ${type}`,
    };
  }

  async verifyCode({ sessionId, code, type, contact, purpose }) {
    const verificationCode =
      await this.verificationCodeRepository.findActiveCode({
        email: type === "email" ? contact : null,
        phone: type === "phone" ? contact : null,
        type: purpose,
        verified: false,
        expires_at: { [Op.gt]: new Date() },
      });

    if (!verificationCode) {
      throw new BadRequestError("Invalid or expired verification code");
    }

    if (type === "email") {
      // For email, verify the code directly
      if (verificationCode.code !== code) {
        throw new BadRequestError("Invalid verification code");
      }
    } else {
      // // For phone, verify using Infobip's 2FA API
      // const smsService = require('./sms.Service.new');
      // // Initialize SMS service if not already initialized
      // if (!global.smsServiceInitialized) {
      //   await smsService.init();
      //   global.smsServiceInitialized = true;
      // }
      // try {
      //   const verified = await smsService.verify2FAPin(verificationCode.pin_id, code);
      //   if (!verified) {
      //     throw new BadRequestError('Invalid verification code');
      //   }
      // } catch (error) {
      //   throw new BadRequestError('Invalid verification code');
      // }
    }

    // Mark code as verified
    await this.verificationCodeRepository.markAsVerified(verificationCode.id);

    return { message: "Code verified successfully" };
  }

  async completeRegistration({ sessionId, fullName, password, contact, type }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data according to model schema
    const userData = {
      fullname: fullName,
      password_hash: hashedPassword,
      ...(type === "email"
        ? {
            email: contact,
            is_email_verified: true,
          }
        : {
            phone_number: contact,
            is_phone_verified: true,
          }),
    };

    // Create user
    const user = await this.userRepository.create(userData);

    // Auto-create empty profile for the user (use user.user_id which is the PK)
    try {
      const profileRepo = new ProfileRepository();
      const userId = user.user_id || user.id || (user.get && user.get('user_id'));
      if (userId) {
        await profileRepo.createProfile({ user_id: userId });
      } else {
        const logger = require('../infrastructure/logging.service').getLogger();
        logger && logger.warn && logger.warn('[Auth] completeRegistration: could not determine user id to create profile', { user });
      }
    } catch (err) {
      const logger = require('../infrastructure/logging.service').getLogger();
      logger && logger.error && logger.error('[Auth] Failed to create profile after registration', { message: err.message });
    }

    // Generate JWT token
    const { token } = jwtService.jwtSign(user);

    return {
      user,
      token,
      message: "Registration completed successfully",
    };
  }

  async login(email, phone, password) {
    const user = await this.userRepository.findByEmailOrPhone(email, phone);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // The User model stores the hashed password in `password_hash`
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const { token } = jwtService.jwtSign(user);

    return {
      user,
      token,
    };
  }

  async initiatePasswordReset(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Create verification code with reset token
    const verificationCode = await this.verificationCodeRepository.create({
      email,
      type: "password_reset",
      verify_type: "email",
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      reset_token: resetToken,
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, resetToken);

    return {
      message: "Password reset instructions sent to your email",
    };
  }

  async resetPassword(resetToken, newPassword) {
    const verificationCode =
      await this.verificationCodeRepository.findByResetToken(resetToken);
    if (!verificationCode || verificationCode.token_used) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password (model field is `password_hash`)
    await this.userRepository.update(
      { password_hash: hashedPassword },
      { where: { email: verificationCode.email } }
    );

    // Mark reset token as used
    await this.verificationCodeRepository.update(
      { token_used: true },
      { where: { id: verificationCode.id } }
    );

    return {
      message: "Password reset successfully",
    };
  }

  async registerSocial(userData) {
    const {
      email,
      firstName,
      lastName,
      username,
      provider_type,
      provider_token,
    } = userData;

    // Check if user exists by email
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Create new user
      user = await this.userRepository.create({
        email,
        first_name: firstName,
        last_name: lastName,
        username,
        is_email_verified: true, // Email is verified through social provider
        password_hash: null, // No password for social login
      });

      // Auto-create profile for social user
      try {
        const profileRepo = new ProfileRepository();
        const userId = user.user_id || user.id || (user.get && user.get('user_id'));
        if (userId) {
          await profileRepo.createProfile({ user_id: userId });
        }
      } catch (err) {
        const logger = require('../infrastructure/logging.service').getLogger();
        logger && logger.error && logger.error('[Auth] Failed to create profile for social user', { message: err.message });
      }
    }

    // Create social login record via repository
    const socialRepo = new SocialLoginRepository();
    await socialRepo.createSocialLogin({
      user_id: user.id,
      provider_type,
      provider_token,
    });

    // Generate JWT token
    const { token } = jwtService.jwtSign(user);

    return {
      user,
      token,
      message: "Social registration successful",
    };
  }
}

module.exports = new AuthService();
