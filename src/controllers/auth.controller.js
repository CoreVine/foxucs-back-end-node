'use strict';

const authService = require('../services/auth.service');
const registrationSessionService = require('../services/registrationSession.service');
const { ApiError } = require('../utils/errors');
const responseHandler = require('../utils/responseHandler');
const db = require('../models');
const SocialLogin = db.SocialLogin;

const authController = {
  async initiateRegister(req, res, next) {
    try {
      const { email, phone } = req.body;
      const type = email ? 'email' : 'phone';
      const contact = email || phone;

      // Start registration session
      const sessionId = await registrationSessionService.createSession(contact, type);

      // Send verification code
      const result = await authService.sendVerificationCode({
        sessionId,
        type,
        contact,
        purpose: 'registration'
      });

      return responseHandler.success(res, {
        sessionId,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  async resendVerificationCode(req, res, next) {
    try {
      const { email, phone } = req.body;
      const type = email ? 'email' : 'phone';
      const contact = email || phone;

      // Create new session for resend
      const sessionId = await registrationSessionService.createSession(contact, type);

      // Resend verification code
      const result = await authService.sendVerificationCode({
        sessionId,
        type,
        contact,
        purpose: 'registration'
      });

      return responseHandler.success(res, {
        sessionId,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyRegistration(req, res, next) {
    try {
      const { code, email, phone, sessionId } = req.body;
      const type = email ? 'email' : 'phone';
      const contact = email || phone;

      // Verify the code
      await authService.verifyCode({
        sessionId,
        code,
        type,
        contact,
        purpose: 'registration'
      });

      // Mark session as verified
      await registrationSessionService.markAsVerified(sessionId);

      return responseHandler.success(res, {
        message: 'Verification successful',
        sessionId
      });
    } catch (error) {
      next(error);
    }
  },

  async completeRegister(req, res, next) {
    try {
      const { sessionId, fullName, password } = req.body;

      // Get session data
      const session = await registrationSessionService.getSession(sessionId);
      
      if (!session.verified) {
        throw new ApiError('Please verify your contact before completing registration', 400);
      }

      // Complete registration
      const result = await authService.completeRegistration({
        sessionId,
        fullName,
        password,
        contact: session.contact,
        type: session.type
      });

      // Clean up session
      await registrationSessionService.deleteSession(sessionId);

      return responseHandler.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, phone, password } = req.body;

      if (!password || (!email && !phone)) {
        throw new ApiError('Email/phone and password are required', 400);
      }

      const result = await authService.login(email, phone, password);
      return responseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async initiatePasswordReset(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError('Email is required', 400);
      }

      const result = await authService.initiatePasswordReset(email);
      return responseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;

      if (!resetToken || !newPassword) {
        throw new ApiError('Reset token and new password are required', 400);
      }

      const result = await authService.resetPassword(resetToken, newPassword);
      return responseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async registerBySocial(req, res, next) {
    try {
      const { provider_type, provider_token, email, firstName, lastName, username } = req.body;
      
      if (!provider_type || !provider_token) {
        throw new ApiError('Provider type and token are required', 400);
      }

      const provider = provider_type.toLowerCase();

      // Check for existing social login
      const existingSocial = await SocialLogin.findOne({ 
        where: { provider_token }, 
        include: [{ model: db.User, as: 'user' }] 
      });

      if (existingSocial && existingSocial.user) {
        const user = existingSocial.user.toJSON();
        delete user.password;
        const result = await authService.createSession(user);
        return responseHandler.success(res, { 
          message: 'Social login successful',
          user,
          token: result.token 
        });
      }

      // Register new user with social login
      const result = await authService.registerSocial({
        email,
        firstName,
        lastName,
        username,
        provider_type: provider,
        provider_token
      });

      return responseHandler.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;