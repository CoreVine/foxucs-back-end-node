const { Router } = require('express');
const adminController = require('../controllers/admin/admin.controller');
const adminAuth = require('../middlewares/adminAuth.middleware');
const requireRole = require('../middlewares/requireRole.middleware');
const activityLogger = require('../middlewares/activityLogger.middleware');
const validate = require('../middlewares/validation.middleware');
const Yup = require('yup');

const router = Router();

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
	roleIds: Yup.array().of(Yup.number()).nullable()
});

router.post('/admin/login', validate(adminLoginSchema), adminController.login);

// Protected admin endpoints
router.get(
	'/admin/activity',
	adminAuth,
	requireRole('super_admin'),
	activityLogger('view_activity', 'activity'),
	adminController.activity
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

// Role management
router.get(
	'/admin/roles',
	adminAuth,
	requireRole('super_admin'),
	activityLogger('list_roles', 'roles'),
	adminController.listRoles
);
router.post(
	'/admin/roles',
	adminAuth,
	requireRole('super_admin'),
	validate(createRoleSchema),
	activityLogger('create_role', 'roles'),
	adminController.createRole
);

// Create admin
router.post(
	'/admin',
	adminAuth,
	requireRole('super_admin'),
	validate(createAdminSchema),
	activityLogger('create_admin', 'admins'),
	adminController.createAdmin
);

module.exports = router;
