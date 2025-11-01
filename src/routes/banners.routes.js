'use strict';

const { Router } = require('express');
const validate = require('../middlewares/validation.middleware');
const Yup = require('yup');
const requireRole = require('../middlewares/requireRole.middleware');
const activityLogger = require('../middlewares/activityLogger.middleware');
const router = Router();

/* Validation schemas */
const createBannerSchema = Yup.object().shape({
  
  title: Yup.string().min(3).max(100).required(),
  url: Yup.string().min(3).max(100).nullable()
});