const jwtService = require('../infrastructure/jwt.service');
const AdminRepository = require('../data-access/admins');

module.exports = async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    const token = authHeader.substring(7);
    const decoded = jwtService.jwtVerify(token);
    // decoded is the payload we signed
    req.adminId = decoded.admin_id;
    req.adminRoles = decoded.roles || [];

    // Optionally refresh roles from DB for authoritative check
    const repo = new AdminRepository();
    const admin = await repo.findById(req.adminId);
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
