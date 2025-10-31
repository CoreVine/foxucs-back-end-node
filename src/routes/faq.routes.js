// 'use strict';

// const { Router } = require('express');
// const validate = require('../middlewares/validation.middleware');
// const Yup = require('yup');

// const router = Router();

// /* Validation schemas */
// const createFaqSchema = Yup.object().shape({
//   question: Yup.string().min(10).max(500).required(),
//   answer: Yup.string().min(10).max(2000).required(),
// });
// const updateFaqSchema = Yup.object().shape({
//   id: Yup.number().required(),
//   question: Yup.string().min(10).max(500).nullable(),
//   answer: Yup.string().min(10).max(2000).nullable(),
// });

// router.post(
//   '/faqs',
//   validate(createFaqSchema),
// );

// router.put(
//   '/faqs',
//   validate(updateFaqSchema),
// );

// router.delete(
//   '/faqs/:id',
// );
// module.exports = router;