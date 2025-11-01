"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Skip seeding if table already has rows
    const [results] = await queryInterface.sequelize.query("SELECT COUNT(*) as count FROM admin_activity_logs;");
    const existingCount = results && results[0] && (results[0].count || results[0]['COUNT(*)']);
    if (Number(existingCount) > 0) {
      return Promise.resolve();
    }

    const adminIds = [1,2,3,4,5,6];
    const actions = ['login','create_user','update','assign_roles','delete','logout'];
    const resources = [null,'users','roles','admins','settings'];

    const rows = [];
    for (const adminId of adminIds) {
      for (let i = 0; i < 6; i++) {
        const action = actions[(adminId + i) % actions.length];
        const resource = resources[(adminId + i) % resources.length];
        rows.push({
          admin_id: adminId,
          action,
          resource,
          resource_id: resource ? String((adminId * 10) + i) : null,
          route: resource ? `/${resource}` : '/admin/login',
          ip: '127.0.0.1',
          user_agent: 'Seeder',
          metadata: JSON.stringify({ seeded: true, index: i })
        });
      }
    }

    return queryInterface.bulkInsert('admin_activity_logs', rows, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seeded rows by matching the user_agent we used above
    return queryInterface.bulkDelete('admin_activity_logs', { user_agent: 'Seeder' }, {});
  }
};
