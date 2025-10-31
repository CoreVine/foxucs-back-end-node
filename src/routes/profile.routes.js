const { Router } = require('express');
const Yup = require('yup');
const validate = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profile.controller');
const requireProfileFields = require('../middlewares/requireProfileFields.middleware');
const noRedundantProfileUpdate = require('../middlewares/noRedundantProfileUpdate.middleware');
const multerConfig = require('../config/multer.config');

const router = Router();

const profileSchema = Yup.object().shape({
    name: Yup.string().min(2).max(100).nullable(),
    email: Yup.string().email().nullable(),
    phone: Yup.string().min(10).max(15).nullable(),
	address: Yup.string().nullable(),
	gender: Yup.boolean().nullable(),
	birthdate: Yup.date().nullable()
});

// GET current user's profile
router.get('/profile', authMiddleware, profileController.getProfile);

// PUT to create/update profile
// Order: auth -> multer -> validate -> presence check -> redundancy check -> controller
{
	const uploader = multerConfig.createUploader({ uploadPath: 'uploads/profile', fileFilter: 'images', maxFileSize: 2 * 1024 * 1024 }); // 2 MB
	// Normalize uploader.single(...) to always be an array of middleware(s)
	const uploadMiddlewareResult = uploader.single('profile_picture');
	const uploadMiddlewares = Array.isArray(uploadMiddlewareResult)
		? uploadMiddlewareResult
		: [uploadMiddlewareResult];

	router.put(
		'/profile',
		authMiddleware,
		// Accept multipart/form-data with single file field `profile_picture`
		...uploadMiddlewares,
		validate(profileSchema),
		requireProfileFields(),
		noRedundantProfileUpdate,
		profileController.upsertProfile
	);
}

module.exports = router;

