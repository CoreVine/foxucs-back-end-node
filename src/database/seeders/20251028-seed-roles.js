"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const rolesToEnsure = [
      { name: 'dashboard', description: 'Access dashboard', created_at: new Date(), updated_at: new Date() },
      { name: 'users', description: 'Manage users', created_at: new Date(), updated_at: new Date() },
      { name: 'ads', description: 'Manage ads', created_at: new Date(), updated_at: new Date() },
      { name: 'categories', description: 'Manage categories', created_at: new Date(), updated_at: new Date() },
      { name: 'payment', description: 'Manage payments', created_at: new Date(), updated_at: new Date() },
      { name: 'super_admin', description: 'Full access to the system', created_at: new Date(), updated_at: new Date() }
    ];

    // Fetch existing role names
    const [existing] = await queryInterface.sequelize.query(
      `SELECT name FROM roles WHERE name IN (${rolesToEnsure.map(r => `'${r.name}'`).join(',')})`
    );

    const existingNames = (existing || []).map(r => r.name);

    // Filter roles that are missing
    const toInsert = rolesToEnsure.filter(r => !existingNames.includes(r.name));

    if (toInsert.length) {
      await queryInterface.bulkInsert('roles', toInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    const roleNames = ['dashboard','users','ads','categories','payment','super_admin'];
    await queryInterface.bulkDelete('roles', { name: roleNames }, {});
  }
};
