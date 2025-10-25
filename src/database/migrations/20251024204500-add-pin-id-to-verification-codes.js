'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('verification_codes', 'pin_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'code'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('verification_codes', 'pin_id');
  }
};