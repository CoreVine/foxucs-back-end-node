const bcrypt = require('bcryptjs');

/**
 * Idempotent seeder that creates one admin user per role and assigns the role via admin_roles.
 * - Dev-only default password is used; change in production.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      { name: 'dashboard', description: 'Dashboard administrator' },
      { name: 'users', description: 'User management administrator' },
      { name: 'ads', description: 'Ads management administrator' },
      { name: 'categories', description: 'Categories management administrator' },
      { name: 'payment', description: 'Payment administrator' },
      { name: 'super_admin', description: 'Super administrator with elevated privileges' }
    ];

    // Default developer password for seeded admins. Replace in real environments.
    const DEFAULT_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe!123';
    const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
    const now = new Date();

    for (const role of roles) {
      const adminIdentifier = `${role.name}_admin`;
      const adminEmail = `admin+${role.name}@example.com`;

      // Check if admin already exists
      const existingAdmins = await queryInterface.sequelize.query(
        'SELECT id FROM admins WHERE email = :email LIMIT 1',
        { replacements: { email: adminEmail }, type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      let adminId;
      if (!existingAdmins || existingAdmins.length === 0) {
        // Insert admin
        await queryInterface.bulkInsert(
          'admins',
          [
            {
              username: adminIdentifier,
              email: adminEmail,
              password_hash: passwordHash,
              is_active: true,
              attributes: JSON.stringify({ seeded: true }),
              created_at: now,
              updated_at: now
            }
          ],
          {}
        );

        // fetch the inserted admin id
        const rows = await queryInterface.sequelize.query(
          'SELECT id FROM admins WHERE email = :email LIMIT 1',
          { replacements: { email: adminEmail }, type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        adminId = rows && rows.length ? rows[0].id : null;
      } else {
        adminId = existingAdmins[0].id;
      }

      if (!adminId) continue; // defensive

      // Ensure role exists, get role id
      const roleRows = await queryInterface.sequelize.query(
        'SELECT id FROM roles WHERE name = :name LIMIT 1',
        { replacements: { name: role.name }, type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      let roleId = roleRows && roleRows.length ? roleRows[0].id : null;

      if (!roleId) {
        // Role missing; insert it (keeps seeder tolerant) and re-read id
        await queryInterface.bulkInsert(
          'roles',
          [
            {
              name: role.name,
              description: role.description || null,
              created_at: now,
              updated_at: now
            }
          ],
          {}
        );

        const newRoleRows = await queryInterface.sequelize.query(
          'SELECT id FROM roles WHERE name = :name LIMIT 1',
          { replacements: { name: role.name }, type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        roleId = newRoleRows && newRoleRows.length ? newRoleRows[0].id : null;
      }

      if (!roleId) continue; // defensive

      // assign role if not assigned yet
      const assignmentRows = await queryInterface.sequelize.query(
        'SELECT 1 FROM admin_roles WHERE admin_id = :adminId AND role_id = :roleId LIMIT 1',
        { replacements: { adminId, roleId }, type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!assignmentRows || assignmentRows.length === 0) {
        await queryInterface.bulkInsert(
          'admin_roles',
          [
            {
              admin_id: adminId,
              role_id: roleId,
              created_at: now,
              updated_at: now
            }
          ],
          {}
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seeded admins and their admin_roles by email pattern admin+<role>@example.com
    const emails = [
      'admin+dashboard@example.com',
      'admin+users@example.com',
      'admin+ads@example.com',
      'admin+categories@example.com',
      'admin+payment@example.com',
      'admin+super_admin@example.com'
    ];

    // Delete admin_roles for those admins
    await queryInterface.sequelize.query(
      `DELETE ar FROM admin_roles ar
       JOIN admins a ON a.id = ar.admin_id
       WHERE a.email IN (:emails)`,
      { replacements: { emails } }
    );

    // Delete the admins
    await queryInterface.bulkDelete('admins', { email: emails }, {});
  }
};
