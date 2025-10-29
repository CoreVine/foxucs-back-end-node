"use strict";

const bcrypt = require('bcryptjs');
const AdminRepository = require('../data-access/admins');
const RoleRepository = require('../data-access/roles');
const jwtService = require('../infrastructure/jwt.service');
const adminActivity = require('../services/adminActivity.service');
const responseHandler = require('../utils/responseHandler');
const { BadRequestError, NotFoundError } = require('../utils/errors');

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
      const admin = await repo.findById(req.adminId);
      if (!admin) throw new NotFoundError('Admin not found');

      const logs = await admin.getActivity_logs({ order: [['created_at', 'DESC']], limit: 100 });
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
      const { username, email, password, profile_picture_url, roleIds } = req.body;

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
};

module.exports = adminController;
