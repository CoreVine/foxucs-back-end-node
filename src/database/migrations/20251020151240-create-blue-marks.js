// ...existing code...
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('blue_marks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        // match users.user_id INT UNSIGNED
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      document_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'document_types', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      document_url: {
        type: Sequelize.TEXT,
        allowNull: false
      }
      // No created_at/updated_at here (match your python model which had none).
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('blue_marks');
  }
};