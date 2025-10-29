/**
 * CloudinaryService
 *
 * Lightweight wrapper around the cloudinary v2 SDK used across the project.
 * Provide credentials via environment variables and call `CloudinaryService.init()`
 * once (for example, during app bootstrap or in controllers before first upload).
 *
 * Exposed methods:
 *  - init()
 *  - uploadFile(filePath, options)
 *  - uploadBuffer(buffer, filename, options)
 *
 * Notes:
 *  - The service delegates to cloudinary.uploader.upload. Pass any options supported
 *    by the Cloudinary SDK (folder, public_id, resource_type, transformation, etc.).
 *  - For non-image files (documents, txt, etc.) use `{ resource_type: 'raw' }`.
 *  - When using multer memory storage, prefer `uploadBuffer` to avoid extra disk writes
 *    (the implementation writes to /tmp then uploads). For high throughput consider
 *    a streaming approach or a dedicated temporary storage.
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Logging service lives under src/infrastructure
const logger = require('./logging.service').getLogger();

const CloudinaryService = {
  /**
   * Initialize cloudinary configuration from env.
   * Call before the first upload (controller middleware or app bootstrap).
   */
  init() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      logger.warn('[Cloudinary] Missing configuration in env. Cloudinary uploads will fail until configured.');
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  },

  /**
   * Upload a local file path to Cloudinary
   * @param {string} filePath - Absolute or relative path to the file
   * @param {object} options - Cloudinary upload options (folder, public_id, resource_type, transformation...)
   * @returns {Promise<object>} upload result
   *
   * Example:
   * await CloudinaryService.uploadFile('/tmp/photo.jpg', { folder: 'profiles' });
   */
  async uploadFile(filePath, options = {}) {
    try {
      const res = await cloudinary.uploader.upload(filePath, options);
      return res;
    } catch (error) {
      logger.error('[Cloudinary] uploadFile error', { message: error.message });
      throw error;
    }
  },

  /**
   * Upload from a buffer (useful if multer stores in memory)
   * The implementation writes the buffer to a temp file under OS temp dir and uploads it.
   * @param {Buffer} buffer
   * @param {string} filename - original filename (used to create temp file)
   * @param {object} options - Cloudinary upload options
   * @returns {Promise<object>} upload result
   *
   * Example (multer memoryStorage):
   * const result = await CloudinaryService.uploadBuffer(req.file.buffer, req.file.originalname, { folder: 'profiles' });
   */
  async uploadBuffer(buffer, filename, options = {}) {
    try {
      const safeName = `${Date.now()}-${path.basename(filename || 'upload')}`;
      const tmpPath = path.join(require('os').tmpdir(), safeName);
      await fs.promises.writeFile(tmpPath, buffer);
      const res = await cloudinary.uploader.upload(tmpPath, options);
      await fs.promises.unlink(tmpPath).catch(() => {});
      return res;
    } catch (error) {
      logger.error('[Cloudinary] uploadBuffer error', { message: error.message });
      throw error;
    }
  }
};

module.exports = CloudinaryService;
