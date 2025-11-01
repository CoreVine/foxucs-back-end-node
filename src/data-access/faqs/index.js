const db = require('../../models');

class FaqRepository {
  constructor() {
    this.model = db.Faq;
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    const faq = await this.model.findByPk(id);
    if (!faq) return null;
    await faq.update(data);
    return faq.reload();
  }

  async findById(id, { includeInactive = false } = {}) {
    const where = {};
    if (!includeInactive) where.is_active = true;
    return this.model.findOne({ where: { id, ...where } });
  }

  async findAll({ includeInactive = false } = {}) {
    const where = {};
    if (!includeInactive) where.is_active = true;
    return this.model.findAll({ where, order: [['created_at', 'DESC']] });
  }

  async softToggle(id) {
    const faq = await this.model.findByPk(id);
    if (!faq) return null;
    faq.is_active = !faq.is_active;
    await faq.save();
    return faq;
  }

  async hardDelete(id) {
    const faq = await this.model.findByPk(id);
    if (!faq) return null;
    await faq.destroy();
    return faq;
  }
}

module.exports = FaqRepository;
