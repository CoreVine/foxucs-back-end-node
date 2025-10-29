const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Profile.init(
    {
      user_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: true },
      profile_picture_url: { type: DataTypes.STRING, allowNull: true },
      gender: { type: DataTypes.BOOLEAN, allowNull: true },
      birthdate: { type: DataTypes.DATEONLY, allowNull: true }
    },
    {
      sequelize,
      profile_picture_url: { type: DataTypes.STRING, allowNull: true },
      modelName: 'Profile',
      tableName: 'profiles',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Profile;
};