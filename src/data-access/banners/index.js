const db = require('../../models');

class BannerRepository {
  constructor() {
    this.model = db.Banner;
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    const banner = await this.model.findByPk(id);
    if (!banner) return null;
    await banner.update(data);
    return banner.reload();
  }

  async findById(id) {
    return this.model.findByPk(id);
  }

  async findAll({ onlyActive = true, limit = 100, offset = 0 } = {}) {
    const where = {};
    if (onlyActive) where.is_active = true;
    return this.model.findAll({ where, order: [['order', 'ASC'], ['created_at', 'DESC']], limit, offset });
  }

  async softToggle(id) {
    const banner = await this.model.findByPk(id);
    if (!banner) return null;
    banner.is_active = !banner.is_active;
    await banner.save();
    return banner;
  }

  async delete(id) {
    const banner = await this.model.findByPk(id);
    if (!banner) return null;
    await banner.destroy();
    return banner;
  }
}

module.exports = BannerRepository;
