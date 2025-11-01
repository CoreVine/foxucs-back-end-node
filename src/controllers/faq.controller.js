const FaqRepository = require('../data-access/faqs');
const responseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const faqController = {
  async create(req, res, next) {
    try {
      const { question, answer } = req.body;
      const repo = new FaqRepository();
      const faq = await repo.create({ question, answer });
      return responseHandler.success(res, { faq }, 201, 'FAQ created');
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id, question, answer } = req.body;
      if (!id) throw new BadRequestError('id is required');
      const repo = new FaqRepository();
      const updated = await repo.update(id, { question, answer });
      if (!updated) throw new NotFoundError('FAQ not found');
      return responseHandler.success(res, { faq: updated }, 200, 'FAQ updated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /faqs/:id
   * - soft toggle is_active by default
   * - hard delete when ?force=true
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const force = req.query && (req.query.force === '1' || req.query.force === 'true');
      const repo = new FaqRepository();
      if (force) {
        const deleted = await repo.hardDelete(Number(id));
        if (!deleted) throw new NotFoundError('FAQ not found');
        return responseHandler.success(res, { message: 'FAQ permanently deleted' });
      }

      const toggled = await repo.softToggle(Number(id));
      if (!toggled) throw new NotFoundError('FAQ not found');
      const message = toggled.is_active ? 'FAQ restored' : 'FAQ soft-deleted';
      return responseHandler.success(res, { faq: toggled, message });
    } catch (err) {
      next(err);
    }
  }
,
  /**
   * GET /faqs
   * Public endpoint that returns active FAQs (most recent first).
   */
  async getAll(req, res, next) {
    try {
      const repo = new FaqRepository();
      // By default only return active FAQs. The repository supports includeInactive
      // via an option, but this public endpoint should only show active items.
      const faqs = await repo.findAll({ includeInactive: false });
      return responseHandler.success(res, { faqs });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = faqController;