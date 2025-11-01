"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('banners', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(100), allowNull: false },
      url: { type: Sequelize.STRING(255), allowNull: true },
      image_url: { type: Sequelize.STRING(1024), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      order: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('banners', ['is_active']);
    await queryInterface.addIndex('banners', ['order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('banners');
  }
};
