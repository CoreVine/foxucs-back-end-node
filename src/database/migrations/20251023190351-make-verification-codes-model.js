'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verification_codes', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('registration', 'password_reset', 'change_email', 'change_phone'),
        allowNull: false
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      token_used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      attempt_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      verify_type: {
        type: Sequelize.ENUM('phone', 'email'),
        allowNull: false
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

    // Add indexes
    await queryInterface.addIndex('verification_codes', ['email', 'type'], {
      name: 'verification_code_email_type_idx'
    });
    await queryInterface.addIndex('verification_codes', ['reset_token'], {
      name: 'verification_code_reset_token_idx'
    });
    await queryInterface.addIndex('verification_codes', ['expires_at'], {
      name: 'verification_code_expires_at_idx'
    });

    // Add unique index for active verification codes
    await queryInterface.addIndex('verification_codes', 
      ['email', 'phone', 'type', 'verify_type', 'verified'], {
      name: 'unique_active_verification',
      unique: true,
      where: {
        verified: false,
        expires_at: { [Sequelize.Op.gt]: Sequelize.fn('NOW') }
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('verification_codes');
  }
};