const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const adminAuth = require('../middlewares/adminAuth.middleware');
const requireRole = require('../middlewares/requireRole.middleware');
const activityLogger = require('../middlewares/activityLogger.middleware');
const validate = require('../middlewares/validation.middleware');
const Yup = require('yup');

const router = Router();
const multerConfig = require('../config/multer.config');

/* Validation schemas */
const adminLoginSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().required()
});

const createRoleSchema = Yup.object().shape({
	name: Yup.string().required(),
	description: Yup.string().required()
});

const assignRolesSchema = Yup.object().shape({
	roleIds: Yup.array().of(Yup.number().required()).min(1).required()
});

const createAdminSchema = Yup.object().shape({
	username: Yup.string().required(),
	email: Yup.string().email().required(),
	password: Yup.string().min(6).required(),
	profile_picture_url: Yup.string().url().nullable(),
	roleIds: Yup.array().of(Yup.number())
		.nullable()
		.transform((value, originalValue) => {
			// Accept JSON string like "[1,2]" or comma-separated "1,2"
			if (typeof originalValue === 'string' && originalValue.length) {
				try {
					return JSON.parse(originalValue);
				} catch (e) {
					if (originalValue.indexOf(',') !== -1) {
						return originalValue.split(',').map(s => Number(s.trim())).filter(Boolean);
					}
				}
			}
			return value;
		})
});

const updateAdminSchema = Yup.object().shape({
  username: Yup.string().nullable(),
  email: Yup.string().email().nullable(),
  password: Yup.string().min(6).nullable(),
  profile_picture_url: Yup.string().url().nullable(),
	roleIds: Yup.array().of(Yup.number())
		.nullable()
		.transform((value, originalValue) => {
			if (typeof originalValue === 'string' && originalValue.length) {
				try {
					return JSON.parse(originalValue);
				} catch (e) {
					if (originalValue.indexOf(',') !== -1) {
						return originalValue.split(',').map(s => Number(s.trim())).filter(Boolean);
					}
				}
			}
			return value;
		})
});

// Prepare uploader for admin profile picture (images only, 2MB)
{
	const uploader = multerConfig.createUploader({ uploadPath: 'uploads/admins', fileFilter: 'images', fileSize: 2 * 1024 * 1024 });
	const uploadMiddlewareResult = uploader.single('profile_picture');
	// Normalized array of middlewares (multer single might return a function or an array)
	var adminUploadMiddlewares = Array.isArray(uploadMiddlewareResult) ? uploadMiddlewareResult : [uploadMiddlewareResult];
}

router.post('/admin/login', validate(adminLoginSchema), adminController.login);


// router.post(
// 	'/admin/roles',
// 	adminAuth,
// 	requireRole('super_admin'),
// 	validate(createRoleSchema),
// 	activityLogger('create_role', 'roles'),
// 	adminController.createRole
// );

// Create admin
router.post(
	'/admin',
	adminAuth,
	requireRole('super_admin'),
	// handle optional profile picture upload
	...adminUploadMiddlewares,
	validate(createAdminSchema),
	activityLogger('create_admin', 'admins'),
	adminController.createAdmin
);
// Assign roles to admin (super admin only)
router.post(
	'/admin/:id/roles',
	adminAuth,
	requireRole('super_admin'),
	validate(assignRolesSchema),
	activityLogger('assign_roles', 'roles'),
	adminController.assignRoles
);
// Update admin (super admin only)
router.put(
  '/admin/:id',
  adminAuth,
  requireRole('super_admin'),
	// handle optional profile picture upload
	...adminUploadMiddlewares,
  validate(updateAdminSchema),
  activityLogger('update_admin', 'admins'),
  adminController.updateAdmin
);
// Delete admin (super admin only)
router.delete(
	'/admin/:id',
	adminAuth,
	requireRole('super_admin'),
	activityLogger('delete_admin', 'admins'),
	adminController.deleteAdmin
);
// Get current admin's profile
router.get(
	'/admin/me',
	adminAuth,
	activityLogger('view_self', 'admins'),
	adminController.me
);
// Protected admin endpoints
router.get(
	'/admin/activity',
	adminAuth,
	requireRole('super_admin'),
	activityLogger('view_activity', 'activity'),
	adminController.activity
);

router.get(
	'/admin/get-all-admins',
	adminAuth,
	requireRole('super_admin'),
	activityLogger('list_admins', 'admins'),
	adminController.getAllAdmins
);



// Role management
router.get(
	'/admin/roles',
	adminAuth,
	requireRole('super_admin'),
	activityLogger('list_roles', 'roles'),
	adminController.listRoles
);

module.exports = router;
