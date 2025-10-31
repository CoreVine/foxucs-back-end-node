const db = require('../../models');

class AdminRepository {
  async create(data) {
    return db.Admin.create(data);
  }

  async findByEmail(email) {
    return db.Admin.findOne({ where: { email }, include: [{ model: db.Role, as: 'roles' }] });
  }

  async findByUsername(username) {
    return db.Admin.findOne({ where: { username }, include: [{ model: db.Role, as: 'roles' }] });
  }

  async findByEmailOrUsername(identifier) {
    return db.Admin.findOne({
      where: db.Sequelize.or({ email: identifier }, { username: identifier }),
      include: [{ model: db.Role, as: 'roles' }]
    });
  }

  async findById(id) {
    return db.Admin.findByPk(id, { include: [{ model: db.Role, as: 'roles' }] });
  }

  async findAll() {
    return db.Admin.findAll({ include: [{ model: db.Role, as: 'roles' }], order: [['created_at', 'DESC']] });
  }

  async delete(adminId) {
    const admin = await db.Admin.findByPk(adminId);
    if (!admin) return null;
    await admin.destroy();
    return admin;
  }

  async assignRoles(adminId, roleIds) {
    const admin = await db.Admin.findByPk(adminId);
    if (!admin) return null;
    const roles = await db.Role.findAll({ where: { id: roleIds } });
    await admin.setRoles(roles);
    return admin.reload({ include: [{ model: db.Role, as: 'roles' }] });
  }
}

module.exports = AdminRepository;
