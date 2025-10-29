const UserRepository = require("../data-access/users");
const ProfileRepository = require("../data-access/profiles");
const loggingService = require("../infrastructure/logging.service");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const fs = require('fs');

// Cloudinary service is located in the top-level services directory
const CloudinaryService = require('../infrastructure/cloudinary.service');

const logger = loggingService.getLogger();

const profileController = {
  async getProfile(req, res, next) {
    try {
      const userPayload = req.userId; // jwt middleware sets decoded payload here
      const userId = userPayload?.user_id;

      if (!userId) {
        throw new NotFoundError("User not found in token");
      }

      const profileRepo = new ProfileRepository();
      const profile = await profileRepo.findByUserId(userId);

      // Always include basic user info alongside profile
      const userRepo = new UserRepository();
      const user = await userRepo.findById(userId);
      const userObj = user ? (typeof user.toJSON === 'function' ? user.toJSON() : user) : null;

      if (!profile) {
        // Return empty profile object together with user so clients can create/update it
        return res.success("Profile not found", { profile: null, user: userObj });
      }

      return res.success("Profile retrieved", { profile, user: userObj });
    } catch (error) {
      logger.error("Error fetching profile", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  },

  async upsertProfile(req, res, next) {
    try {
      const userPayload = req.userId;
      const userId = userPayload?.user_id;

      if (!userId) {
        throw new NotFoundError("User not found in token");
      }

      const { name, email, phone, address, gender, birthdate } = req.body;

      // Use data-access repositories instead of direct model access
      const userRepo = new UserRepository();
      const profileRepo = new ProfileRepository();

      // Ensure user exists and update user-level fields (avoid redundancy)
      const user = await userRepo.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Validate uniqueness for email and phone before updating
      if (typeof email !== "undefined") {
        const existing = await userRepo.findByEmail(email);
        if (existing && existing.user_id !== userId) {
          throw new BadRequestError("Email is already in use");
        }
      }

      if (typeof phone !== "undefined") {
        const existingPhone = await userRepo.findByPhone(phone);
        if (existingPhone && existingPhone.user_id !== userId) {
          throw new BadRequestError("Phone number is already in use");
        }
      }

      // Update user fields only when provided
      const userUpdate = {};
      if (typeof name !== "undefined") userUpdate.fullname = name;
      if (typeof email !== "undefined") userUpdate.email = email;
      if (typeof phone !== "undefined") userUpdate.phone_number = phone;

      if (Object.keys(userUpdate).length) {
        await userRepo.update(userId, userUpdate);
      }
      // Try to find existing profile and update profile-level fields via repository
      let profile = await profileRepo.findByUserId(userId);

      const profileData = { address, gender, birthdate };

      // If there's an uploaded file, upload to Cloudinary and store the returned URL
      if (req.file) {
        try {
          // initialize cloudinary config (will warn if env missing)
          CloudinaryService.init && CloudinaryService.init();

          // If multer saved file to disk, prefer that path
          let uploadResult;
          if (req.file.path) {
            uploadResult = await CloudinaryService.uploadFile(req.file.path, { folder: 'profiles' });
          } else if (req.file.buffer) {
            // memory storage: upload buffer
            const filename = req.file.originalname || `upload-${Date.now()}`;
            uploadResult = await CloudinaryService.uploadBuffer(req.file.buffer, filename, { folder: 'profiles' });
          } else if (req.file.url) {
            // already uploaded by upstream (e.g., S3) — just use provided url
            uploadResult = { secure_url: req.file.url };
          }

          if (uploadResult && uploadResult.secure_url) {
            profileData.profile_picture_url = uploadResult.secure_url;
          }

          // Attempt to remove local temp file when present
          if (req.file.path) {
            fs.unlink(req.file.path, (err) => {
              if (err) logger && logger.warn && logger.warn('[Profile] Failed to unlink temp upload', err.message);
            });
          }
        } catch (err) {
          // Log upload error but continue — surface as BadRequest if you prefer
          logger.error('Cloudinary upload failed', { message: err.message, stack: err.stack });
          // bubble up as a bad request so client knows upload failed
          throw new BadRequestError('Failed to upload profile picture');
        }
      }

      if (profile) {
        await profile.update(profileData);
      } else {
        profile = await profileRepo.createProfile({
          user_id: userId,
          ...profileData,
        });
      }

      // Return both updated user and profile
      const updatedUser = await userRepo.findById(userId); // refetch to include changes
      return res.success("Profile saved", {
        profile,
        user: updatedUser.toJSON(),
      });
    } catch (error) {
      logger.error("Error saving profile", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  },
};

module.exports = profileController;
