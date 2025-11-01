"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Skip if table already populated
    const [results] = await queryInterface.sequelize.query("SELECT COUNT(*) as count FROM banners;");
    const existingCount = results && results[0] && (results[0].count || results[0]['COUNT(*)']);
    if (Number(existingCount) > 0) return Promise.resolve();

    const now = new Date();
    const banners = [
      { title: 'Homepage Hero', url: '/', image_url: null, is_active: true, order: 1, created_at: now, updated_at: now },
      { title: 'Spring Sale', url: '/sale', image_url: null, is_active: true, order: 2, created_at: now, updated_at: now },
      { title: 'New Features', url: '/features', image_url: null, is_active: true, order: 3, created_at: now, updated_at: now },
      { title: 'Enterprise', url: '/enterprise', image_url: null, is_active: true, order: 4, created_at: now, updated_at: now },
      { title: 'Deprecated Promo', url: '/old', image_url: null, is_active: false, order: 5, created_at: now, updated_at: now },
      { title: 'Contact Us', url: '/contact', image_url: null, is_active: true, order: 6, created_at: now, updated_at: now }
    ];

    return queryInterface.bulkInsert('banners', banners, {});
  },

  down: async (queryInterface, Sequelize) => {
    const titles = ['Homepage Hero','Spring Sale','New Features','Enterprise','Deprecated Promo','Contact Us'];
    return queryInterface.bulkDelete('banners', { title: { [Sequelize.Op.in]: titles } }, {});
  }
};
