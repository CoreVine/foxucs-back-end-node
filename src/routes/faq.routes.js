'use strict';

const { Router } = require('express');
const validate = require('../middlewares/validation.middleware');
const Yup = require('yup');
const requireRole = require('../middlewares/requireRole.middleware');
const activityLogger = require('../middlewares/activityLogger.middleware');
const router = Router();
const faqController = require('../controllers/faq.controller');
const adminAuth = require('../middlewares/adminAuth.middleware');
/* Validation schemas */
const createFaqSchema = Yup.object().shape({
  question: Yup.string().min(10).max(500).required(),
  answer: Yup.string().min(10).max(2000).required(),
});
const updateFaqSchema = Yup.object().shape({
  id: Yup.number().required(),
  question: Yup.string().min(10).max(500).nullable(),
  answer: Yup.string().min(10).max(2000).nullable(),
});

router.post(
  '/faqs',
      adminAuth,
  validate(createFaqSchema),
  requireRole('super_admin'),
  activityLogger('Created FAQ'),
  faqController.create
);

router.put(
  '/faqs',
      adminAuth,
  validate(updateFaqSchema),
  requireRole('super_admin'),
    activityLogger('Updated FAQ'),
  faqController.update
);

router.delete(
  '/faqs/:id',
      adminAuth,
  requireRole('super_admin'),
  activityLogger('Deleted FAQ'),
  faqController.delete
);
router.get(
  '/faqs',
  faqController.getAll
);

module.exports = router;