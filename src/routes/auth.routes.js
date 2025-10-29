'use strict';

const { Router } = require('express');
const validate = require('../middlewares/validation.middleware');
const Yup = require('yup');
const authController = require('../controllers/auth.controller');

const router = Router();

/* Validation schemas */
const initiateRegisterSchema = Yup.object().shape({
  email: Yup.string().email(),
  phone: Yup.string()
}).test('email-or-phone', 'Either email or phone is required', value => {
  if (!value.email && !value.phone) {
    return false;
  }
  if (value.email) {
    return Yup.string().email().isValidSync(value.email);
  }
  if (value.phone) {
    return Yup.string().min(10).isValidSync(value.phone);
  }
  return true;
});

const completeRegisterSchema = Yup.object().shape({
  sessionId: Yup.string().required(),
  fullName: Yup.string().required(),
  password: Yup.string().min(6).required(),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref('password')], 'Passwords must match')
});

const verifySchema = Yup.object().shape({
  code: Yup.string().required(),
  email: Yup.string().email(),
  phone: Yup.string()
}).test('email-or-phone', 'Either email or phone is required', value => {
  if (!value.email && !value.phone) {
    return false;
  }
  if (value.email) {
    return Yup.string().email().isValidSync(value.email);
  }
  if (value.phone) {
    return Yup.string().min(10).isValidSync(value.phone);
  }
  return true;
});

const loginSchema = Yup.object().shape({
  email: Yup.string().email(),
  phone: Yup.string(),
  password: Yup.string().required()
}).test('email-or-phone', 'Either email or phone is required', value => {
  if (!value.email && !value.phone) {
    return false;
  }
  if (value.email) {
    return Yup.string().email().isValidSync(value.email);
  }
  if (value.phone) {
    return Yup.string().min(10).isValidSync(value.phone);
  }
  return true;
});

const passwordResetRequestSchema = Yup.object().shape({
  email: Yup.string().email().required()
});

const passwordResetSchema = Yup.object().shape({
  resetToken: Yup.string().required(),
  newPassword: Yup.string().min(6).required()
});

const socialRegisterSchema = Yup.object().shape({
  provider_type: Yup.string().oneOf(['google', 'facebook', 'apple']).required(),
  provider_token: Yup.string().required(),
  email: Yup.string().email().nullable(),
  firstName: Yup.string().nullable(),
  lastName: Yup.string().nullable(),
  username: Yup.string().nullable()
});

/* Endpoints */
// Two-Step Registration
router.post('/register/initiate', validate(initiateRegisterSchema), authController.initiateRegister);
router.post('/register/verify', validate(verifySchema), authController.verifyRegistration);
router.post('/register/complete', validate(completeRegisterSchema), authController.completeRegister);
router.post('/register/resend-code', validate(initiateRegisterSchema), authController.resendVerificationCode);

// Authentication
router.post('/login', validate(loginSchema), authController.login);

// // Password Reset
// router.post('/password/reset/request', validate(passwordResetRequestSchema), authController.initiatePasswordReset);
// router.post('/password/reset', validate(passwordResetSchema), authController.resetPassword);

// // Social Authentication
// router.post('/social/register', validate(socialRegisterSchema), authController.registerBySocial);

module.exports = router;