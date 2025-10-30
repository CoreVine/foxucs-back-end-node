'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_roles', {
      admin_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'admins', key: 'id' },
        onDelete: 'CASCADE',
      },
      role_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE',
      }
    });
    try {
      await queryInterface.addConstraint('admin_roles', {
        fields: ['admin_id', 'role_id'],
        type: 'primary key',
        name: 'pk_admin_roles'
      });
    } catch (err) {
      // ignore if the primary key already exists (safe for re-runs)
      // log for visibility
      // eslint-disable-next-line no-console
      console.log('[MIGRATION] skip adding pk_admin_roles constraint:', err.message);
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admin_roles');
  }
};
