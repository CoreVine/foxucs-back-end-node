'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make migration safe to run multiple times by checking if the column exists
    const tableDesc = await queryInterface.describeTable('profiles');
    if (!tableDesc.profile_picture_url) {
      await queryInterface.addColumn('profiles', 'profile_picture_url', {
        type: Sequelize.STRING(2048),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    // Only remove if the column exists
    const tableDesc = await queryInterface.describeTable('profiles');
    if (tableDesc.profile_picture_url) {
      await queryInterface.removeColumn('profiles', 'profile_picture_url');
    }
  },
};
