const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      this.belongsToMany(models.Role, { through: 'admin_roles', foreignKey: 'admin_id', otherKey: 'role_id', as: 'roles' });
      this.hasMany(models.AdminActivityLog, { foreignKey: 'admin_id', as: 'activity_logs' });
    }
  }

  Admin.init(
    {
      username: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      profile_picture_url: { type: DataTypes.STRING, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      attributes: { type: DataTypes.JSON, allowNull: true }
    },
    {
      sequelize,
      modelName: 'Admin',
      tableName: 'admins',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Admin;
};
