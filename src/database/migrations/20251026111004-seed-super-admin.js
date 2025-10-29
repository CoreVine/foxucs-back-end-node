'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create super_admin role if missing
    const [roles] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'super_admin'");
    let superRoleId;
    if (roles.length === 0) {
      const res = await queryInterface.bulkInsert('roles', [
        { name: 'super_admin', description: 'Full access', created_at: new Date(), updated_at: new Date() }
      ], { returning: ['id'] });
      // depending on DB, res may be array or id
      if (Array.isArray(res) && res.length) superRoleId = res[0];
    } else {
      superRoleId = roles[0].id;
    }

    // Create admin if missing
    const [admins] = await queryInterface.sequelize.query("SELECT id FROM admins WHERE email = 'admin@admin'");
    let adminId;
    if (admins.length === 0) {
      const passwordHash = bcrypt.hashSync('password', 10);
      const insertRes = await queryInterface.bulkInsert('admins', [
        { username: 'admin', email: 'admin@admin', password_hash: passwordHash, profile_picture_url: null, is_active: true, created_at: new Date(), updated_at: new Date() }
      ], { returning: ['id'] });
      if (Array.isArray(insertRes) && insertRes.length) adminId = insertRes[0];
    } else {
      adminId = admins[0].id;
    }

    // Ensure admin_roles linking exists
    if (adminId && superRoleId) {
      const [link] = await queryInterface.sequelize.query(`SELECT * FROM admin_roles WHERE admin_id = ${adminId} AND role_id = ${superRoleId}`);
      if (!link || link.length === 0) {
        await queryInterface.bulkInsert('admin_roles', [{ admin_id: adminId, role_id: superRoleId }]);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admin_roles', { }, {});
    await queryInterface.bulkDelete('admins', { email: 'admin@admin' }, {});
    await queryInterface.bulkDelete('roles', { name: 'super_admin' }, {});
  }
};
