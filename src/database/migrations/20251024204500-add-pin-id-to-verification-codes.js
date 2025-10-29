'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Be defensive: only add the column if it doesn't already exist
    const tableDesc = await queryInterface.describeTable('verification_codes');
    if (!tableDesc.pin_id) {
      await queryInterface.addColumn('verification_codes', 'pin_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        after: 'code'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove only if the column exists
    const tableDesc = await queryInterface.describeTable('verification_codes');
    if (tableDesc.pin_id) {
      await queryInterface.removeColumn('verification_codes', 'pin_id');
    }
  }
};