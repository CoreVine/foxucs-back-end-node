const db = require('../../models');

class RoleRepository {
  async create(data) {
    return db.Role.create(data);
  }

  async findByName(name) {
    return db.Role.findOne({ where: { name } });
  }

  async findAll() {
    return db.Role.findAll();
  }
}

module.exports = RoleRepository;
