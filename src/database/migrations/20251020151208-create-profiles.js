// ...existing code...
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('profiles', {
      user_id: {
        // must match users.user_id (UUID)
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      gender: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('profiles');
  }
};