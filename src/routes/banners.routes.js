'use strict';

const { Router } = require('express');
const validate = require('../middlewares/validation.middleware');
const Yup = require('yup');
const adminAuth = require('../middlewares/adminAuth.middleware');
const requireRole = require('../middlewares/requireRole.middleware');
const activityLogger = require('../middlewares/activityLogger.middleware');
const bannerController = require('../controllers/banner.controller');
const router = Router();
const multerConfig = require('../config/multer.config');
/* Validation schemas */
const createBannerSchema = Yup.object().shape({
  title: Yup.string().min(3).max(100).required(),
  url: Yup.string().min(3).max(255).nullable(),
  order: Yup.number().integer().nullable(),
  is_active: Yup.boolean().nullable()
});

const uploader = multerConfig.createUploader({ uploadPath: 'uploads/banners', fileFilter: 'images', maxFileSize: 5 * 1024 * 1024 }); // 5 MB
// Normalize uploader.single(...) to always be an array of middleware(s)
const uploadMiddlewareResult = uploader.single('banner');
const uploadMiddlewares = Array.isArray(uploadMiddlewareResult) ? uploadMiddlewareResult : [uploadMiddlewareResult];

// Create banner (super_admin)
router.post(
  '/banners',
  adminAuth,
  requireRole('super_admin'),
  ...uploadMiddlewares,
  validate(createBannerSchema),
  activityLogger('create_banner', 'banners'),
  bannerController.create
);

// Update banner (super_admin)
router.put(
  '/banners/:id',
  adminAuth,
  requireRole('super_admin'),
  ...uploadMiddlewares,
  validate(createBannerSchema),
  activityLogger('update_banner', 'banners'),
  bannerController.update
);

// Soft-toggle active/inactive (super_admin)
router.patch(
  '/banners/:id/toggle',
  adminAuth,
  requireRole('super_admin'),
  activityLogger('toggle_banner', 'banners'),
  bannerController.toggle
);

// Public get banners
router.get('/banners', bannerController.getAll);

module.exports = router;