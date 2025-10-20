// ...existing code...
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('social_logins', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        // match users.user_id INT UNSIGNED
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      provider_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      provider_token: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // unique composite index: (user_id, provider_type)
    await queryInterface.addIndex('social_logins', ['user_id', 'provider_type'], {
      unique: true,
      name: 'uniq_sociallogin_user_provider'
    });
  },

  async down (queryInterface) {
    await queryInterface.removeIndex('social_logins', 'uniq_sociallogin_user_provider');
    await queryInterface.dropTable('social_logins');
  }
};