const UserRepository = require('../data-access/users');
const ProfileRepository = require('../data-access/profiles');
const { BadRequestError } = require('../utils/errors');

function toDateString(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

module.exports = async function noRedundantProfileUpdate(req, res, next) {
  try {
    const userPayload = req.userId;
    const userId = userPayload?.user_id;

    if (!userId) return next(new BadRequestError('User not found in token'));

    const body = req.body || {};

    // Fetch current user and profile using repositories
    const userRepo = new UserRepository();
    const profileRepo = new ProfileRepository();

    const user = await userRepo.findById(userId);
    if (!user) return next(new BadRequestError('User not found'));

    // Note: user may include a `profile` association if requested; otherwise fetch separately
    let profile = await profileRepo.findByUserId(userId);

    const checks = [];

    // name -> fullname
    if (typeof body.name !== 'undefined') {
      const a = (user.fullname || '').trim();
      const b = (String(body.name || '')).trim();
      checks.push(a !== b);
    }

    if (typeof body.email !== 'undefined') {
      const a = (user.email || '').trim();
      const b = (String(body.email || '')).trim();
      checks.push(a !== b);
    }

    if (typeof body.phone !== 'undefined') {
      const a = (user.phone_number || '').trim();
      const b = (String(body.phone || '')).trim();
      checks.push(a !== b);
    }

    if (typeof body.address !== 'undefined') {
      const a = (profile?.address || '').trim();
      const b = (String(body.address || '')).trim();
      checks.push(a !== b);
    }

    if (typeof body.gender !== 'undefined') {
      // gender stored as boolean or null
      const a = profile?.gender === null || typeof profile?.gender === 'undefined' ? null : !!profile.gender;
      const b = body.gender === null || typeof body.gender === 'undefined' ? null : !!body.gender;
      checks.push(a !== b);
    }

    if (typeof body.birthdate !== 'undefined') {
      const a = toDateString(profile?.birthdate);
      const b = toDateString(body.birthdate);
      checks.push(a !== b);
    }

    // If any check is true => at least one field differs
    const anyDifferent = checks.some(Boolean);

    if (!anyDifferent) {
      return next(new BadRequestError('No changes detected: provided values match existing user/profile data'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
