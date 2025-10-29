const { BadRequestError } = require('../utils/errors');

/**
 * Middleware factory to ensure at least one of the profile fields is present
 * Usage: requireProfileFields() or requireProfileFields(['name','email'])
 */
module.exports = function(requiredFields = ['name', 'email', 'phone', 'address', 'gender', 'birthdate']) {
  return (req, res, next) => {
    try {
      const body = req.body || {};

      const hasAny = requiredFields.some((field) => {
        const val = body[field];
        if (val === undefined || val === null) return false;
        if (typeof val === 'string') return val.trim() !== '';
        return true; // non-null non-string values (boolean, date, number) are acceptable
      });

      if (!hasAny) {
        throw new BadRequestError(`At least one of the following profile fields must be provided: ${requiredFields.join(', ')}`);
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
