/**
 * requireRole middleware
 * Usage: requireRole('super_admin') or requireRole(['dashboard','payments'])
 */
module.exports = function requireRole(required) {
  const requiredRoles = Array.isArray(required) ? required : [required];

  return (req, res, next) => {
    try {
      const adminRoles = req.adminRoles || (req.admin && (req.admin.roles || []).map(r => r.name)) || [];
      // If any required role is present, allow
      const ok = requiredRoles.some(r => adminRoles.includes(r));
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
      next();
    } catch (err) {
      next(err);
    }
  };
};
