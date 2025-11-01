"use strict";

const BannerRepository = require('../data-access/banners');
const responseHandler = require('../utils/responseHandler');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const fs = require('fs');
const CloudinaryService = require('../infrastructure/cloudinary.service');
const adminActivity = require('../services/adminActivity.service');

const bannerController = {
  async create(req, res, next) {
    try {
      const { title, url, order } = req.body;
      let image_url = null;

      if (req.file) {
        try {
          if (req.file.url) {
            image_url = req.file.url;
          } else {
            CloudinaryService.init && CloudinaryService.init();
            if (req.file.path) {
              const uploadResult = await CloudinaryService.uploadFile(req.file.path, { folder: 'banners' });
              image_url = uploadResult && uploadResult.secure_url ? uploadResult.secure_url : null;
              fs.unlink(req.file.path, () => {});
            } else if (req.file.buffer) {
              const filename = req.file.originalname || `banner-${Date.now()}`;
              const uploadResult = await CloudinaryService.uploadBuffer(req.file.buffer, filename, { folder: 'banners' });
              image_url = uploadResult && uploadResult.secure_url ? uploadResult.secure_url : null;
            }
          }
        } catch (e) {
          return next(new BadRequestError('Failed to upload banner image'));
        }
      }

      const repo = new BannerRepository();
      const banner = await repo.create({ title, url, image_url, order });

      // Log activity (fire-and-forget) if admin performing
      try {
        if (req.adminId) await adminActivity.log({ admin_id: req.adminId, action: 'create', resource: 'banners', resource_id: banner.id, route: req.originalUrl });
      } catch (e) {}

      return responseHandler.success(res, { banner }, 201, 'Banner created');
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, url, order } = req.body;
      const repo = new BannerRepository();
      const banner = await repo.findById(Number(id));
      if (!banner) throw new NotFoundError('Banner not found');

      const updateData = {};
      if (typeof title !== 'undefined') updateData.title = title;
      if (typeof url !== 'undefined') updateData.url = url;
      if (typeof order !== 'undefined') updateData.order = order;

      if (req.file) {
        try {
          if (req.file.url) {
            updateData.image_url = req.file.url;
          } else {
            CloudinaryService.init && CloudinaryService.init();
            if (req.file.path) {
              const uploadResult = await CloudinaryService.uploadFile(req.file.path, { folder: 'banners' });
              updateData.image_url = uploadResult && uploadResult.secure_url ? uploadResult.secure_url : null;
              fs.unlink(req.file.path, () => {});
            } else if (req.file.buffer) {
              const filename = req.file.originalname || `banner-${Date.now()}`;
              const uploadResult = await CloudinaryService.uploadBuffer(req.file.buffer, filename, { folder: 'banners' });
              updateData.image_url = uploadResult && uploadResult.secure_url ? uploadResult.secure_url : null;
            }
          }
        } catch (e) {
          return next(new BadRequestError('Failed to upload banner image'));
        }
      }

      const updated = await repo.update(Number(id), updateData);

      try {
        if (req.adminId) await adminActivity.log({ admin_id: req.adminId, action: 'update', resource: 'banners', resource_id: id, route: req.originalUrl });
      } catch (e) {}

      return responseHandler.success(res, { banner: updated }, 200, 'Banner updated');
    } catch (err) {
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 100;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const repo = new BannerRepository();
      const banners = await repo.findAll({ onlyActive: true, limit, offset });
      return responseHandler.success(res, { banners });
    } catch (err) {
      next(err);
    }
  },

  // soft toggle
  async toggle(req, res, next) {
    try {
      const { id } = req.params;
      const repo = new BannerRepository();
      const toggled = await repo.softToggle(Number(id));
      if (!toggled) throw new NotFoundError('Banner not found');
      return responseHandler.success(res, { banner: toggled });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = bannerController;
