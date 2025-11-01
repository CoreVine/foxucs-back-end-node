"use strict";

const bcrypt = require('bcryptjs');
const AdminRepository = require('../data-access/admins');
const RoleRepository = require('../data-access/roles');
const jwtService = require('../infrastructure/jwt.service');
const adminActivity = require('../services/adminActivity.service');
const responseHandler = require('../utils/responseHandler');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const fs = require('fs');
const CloudinaryService = require('../infrastructure/cloudinary.service');

const adminController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const repo = new AdminRepository();
      const admin = await repo.findByEmail(email);

      if (!admin) throw new BadRequestError('Invalid credentials');

      const isValid = await bcrypt.compare(password, admin.password_hash);
      if (!isValid) throw new BadRequestError('Invalid credentials');

      const roles = (admin.roles || []).map((r) => r.name);
      const payload = { admin_id: admin.id, username: admin.username, roles };
      const tokenRes = jwtService.jwtSign(payload);

      // Log login (fire-and-forget)
      adminActivity.log({ admin_id: admin.id, action: 'login', resource: 'auth', route: '/admin/login' });

      return responseHandler.success(res, {
        token: tokenRes.token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          roles,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async activity(req, res, next) {
    try {
          const repo = new AdminRepository();
          const adminIdParam = Number(req.params.id);
          if (!adminIdParam) throw new BadRequestError('admin id is required');
          const admin = await repo.findById(adminIdParam);
          if (!admin) throw new NotFoundError('Admin not found');

  // AdminActivityLog model doesn't use timestamps (created_at), so order by id instead
  const logs = await admin.getActivity_logs({ order: [['id', 'DESC']], limit: 100 });
      return responseHandler.success(res, { logs });
    } catch (err) {
      next(err);
    }
  },

  async assignRoles(req, res, next) {
    try {
      const { id } = req.params;
      const { roleIds } = req.body;

      const repo = new AdminRepository();
      const updated = await repo.assignRoles(Number(id), roleIds);
      if (!updated) throw new NotFoundError('Admin not found');

      return responseHandler.success(res, { message: 'Roles assigned', admin: { id: updated.id, roles: (updated.roles || []).map((r) => r.name) } });
    } catch (err) {
      next(err);
    }
  },

  async createRole(req, res, next) {
    try {
      const { name, description } = req.body;
      const roleRepo = new RoleRepository();
      const existing = await roleRepo.findByName(name);
      if (existing) throw new BadRequestError('Role already exists');

      const role = await roleRepo.create({ name, description });
      return responseHandler.success(res, { role }, 201, 'Role created');
    } catch (err) {
      next(err);
    }
  },

  async listRoles(req, res, next) {
    try {
      const roleRepo = new RoleRepository();
      const roles = await roleRepo.findAll();
      return responseHandler.success(res, { roles });
    } catch (err) {
      next(err);
    }
  },

  async createAdmin(req, res, next) {
    try {
      const { username, email, password, roleIds } = req.body;

      // handle optional profile picture upload
      let profile_picture_url = null;
      if (req.file) {
        try {
          // If S3 uploader set req.file.url already, use it
          if (req.file.url) {
            profile_picture_url = req.file.url;
          } else {
            CloudinaryService.init && CloudinaryService.init();
            if (req.file.path) {
              const uploadResult = await CloudinaryService.uploadFile(req.file.path, { folder: 'admins' });
              profile_picture_url = uploadResult && uploadResult.secure_url ? uploadResult.secure_url : null;
              // attempt to remove temp file
              fs.unlink(req.file.path, () => {});
            } else if (req.file.buffer) {
              const filename = req.file.originalname || `upload-${Date.now()}`;
              const uploadResult = await CloudinaryService.uploadBuffer(req.file.buffer, filename, { folder: 'admins' });
              profile_picture_url = uploadResult && uploadResult.secure_url ? uploadResult.secure_url : null;
            }
          }
        } catch (err) {
          return next(new BadRequestError('Failed to upload profile picture'));
        }
      }

      const repo = new AdminRepository();
      const existing = await repo.findByEmail(email);
      if (existing) throw new BadRequestError('Admin with that email already exists');

  const password_hash = bcrypt.hashSync(password, 10);
  const admin = await repo.create({ username, email, password_hash, profile_picture_url });

      if (Array.isArray(roleIds) && roleIds.length) {
        await repo.assignRoles(admin.id, roleIds);
      }

      const created = await repo.findById(admin.id);
      return responseHandler.success(res, { admin: { id: created.id, username: created.username, email: created.email, roles: (created.roles || []).map((r) => r.name) } }, 201, 'Admin created');
    } catch (err) {
      next(err);
    }
  },

  async updateAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const { username, email, password, profile_picture_url, roleIds } = req.body;

      const repo = new AdminRepository();
      const admin = await repo.findById(Number(id));
      if (!admin) throw new NotFoundError('Admin not found');

      // If email is changing, ensure uniqueness
      if (email) {
        const existing = await repo.findByEmail(email);
        if (existing && existing.id !== admin.id) throw new BadRequestError('Email is already in use');
      }

      const updateData = {};
      // handle optional profile picture upload
      if (req.file) {
        try {
          if (req.file.url) {
            updateData.profile_picture_url = req.file.url;
          } else {
            CloudinaryService.init && CloudinaryService.init();
            if (req.file.path) {
              const uploadResult = await CloudinaryService.uploadFile(req.file.path, { folder: 'admins' });
              updateData.profile_picture_url = uploadResult && uploadResult.secure_url ? uploadResult.secure_url : null;
              fs.unlink(req.file.path, () => {});
            } else if (req.file.buffer) {
              const filename = req.file.originalname || `upload-${Date.now()}`;
              const uploadResult = await CloudinaryService.uploadBuffer(req.file.buffer, filename, { folder: 'admins' });
              updateData.profile_picture_url = uploadResult && uploadResult.secure_url ? uploadResult.secure_url : null;
            }
          }
        } catch (err) {
          return next(new BadRequestError('Failed to upload profile picture'));
        }
      }
      if (typeof username !== 'undefined' && username !== null) updateData.username = username;
      if (typeof email !== 'undefined' && email !== null) updateData.email = email;
      if (typeof profile_picture_url !== 'undefined' && profile_picture_url !== null) updateData.profile_picture_url = profile_picture_url;
      if (typeof password !== 'undefined' && password !== null) updateData.password_hash = bcrypt.hashSync(password, 10);

      if (Object.keys(updateData).length) {
        await admin.update(updateData);
      }

      // Handle role assignment if provided
      if (Array.isArray(roleIds)) {
        await repo.assignRoles(admin.id, roleIds);
      }

      // Log the update action (fire-and-forget)
      try {
        adminActivity.log({ admin_id: req.adminId, action: 'update', resource: 'admins', route: `/admin/${id}` });
        // If password was changed, log a specific password_change action too (no sensitive data)
        if (typeof password !== 'undefined' && password !== null) {
          adminActivity.log({ admin_id: req.adminId, action: 'password_change', resource: 'admins', resource_id: id, route: `/admin/${id}` });
        }
      } catch (e) {
        // ignore logging errors
      }

      const updated = await repo.findById(admin.id);
      return responseHandler.success(res, { admin: { id: updated.id, username: updated.username, email: updated.email, roles: (updated.roles || []).map((r) => r.name) } }, 200, 'Admin updated');
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const repo = new AdminRepository();
      const adminId = req.adminId;
      if (!adminId) throw new NotFoundError('Admin not found in token');

      const admin = await repo.findById(adminId);
      if (!admin) throw new NotFoundError('Admin not found');

      const result = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        profile_picture_url: admin.profile_picture_url,
        roles: (admin.roles || []).map(r => r.name)
      };

      return responseHandler.success(res, { admin: result });
    } catch (err) {
      next(err);
    }
  },

  async getAllAdmins(req, res, next) {
    try {
      const repo = new AdminRepository();
      const admins = await repo.findAll();

      const payload = admins.map(a => ({
        id: a.id,
        username: a.username,
        email: a.email,
        profile_picture_url: a.profile_picture_url,
        roles: (a.roles || []).map(r => r.name),
        created_at: a.created_at
      }));

      return responseHandler.success(res, { admins: payload });
    } catch (err) {
      next(err);
    }
  },

  async deleteAdmin(req, res, next) {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (Number(req.adminId) === Number(id)) {
        throw new BadRequestError('Admin cannot delete themselves');
      }

      const repo = new AdminRepository();
      const admin = await repo.findById(Number(id));
      if (!admin) throw new NotFoundError('Admin not found');

      await repo.delete(Number(id));

      try {
        adminActivity.log({ admin_id: req.adminId, action: 'delete', resource: 'admins', route: `/admin/${id}` });
      } catch (e) {}

      return responseHandler.success(res, { message: 'Admin deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = adminController;
