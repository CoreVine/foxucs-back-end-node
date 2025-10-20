// ...existing code...
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('document_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('document_types');
  }
};