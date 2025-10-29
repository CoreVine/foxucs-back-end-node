'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_activity_logs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      admin_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'admins', key: 'id' },
        onDelete: 'SET NULL'
      },
      action: { type: Sequelize.STRING(255), allowNull: false },
      resource: { type: Sequelize.STRING(255), allowNull: true },
      resource_id: { type: Sequelize.STRING(255), allowNull: true },
      route: { type: Sequelize.STRING(255), allowNull: true },
      ip: { type: Sequelize.STRING(100), allowNull: true },
      user_agent: { type: Sequelize.STRING(1024), allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admin_activity_logs');
  }
};
