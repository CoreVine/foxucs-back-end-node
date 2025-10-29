const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminActivityLog extends Model {
    static associate(models) {
      this.belongsTo(models.Admin, { foreignKey: 'admin_id', as: 'admin' });
    }
  }

  AdminActivityLog.init(
    {
      action: { type: DataTypes.STRING(255), allowNull: false },
      resource: { type: DataTypes.STRING(255), allowNull: true },
      resource_id: { type: DataTypes.STRING(255), allowNull: true },
      route: { type: DataTypes.STRING(255), allowNull: true },
      ip: { type: DataTypes.STRING(100), allowNull: true },
      user_agent: { type: DataTypes.STRING(1024), allowNull: true },
      metadata: { type: DataTypes.JSON, allowNull: true }
    },
    {
      sequelize,
      modelName: 'AdminActivityLog',
      tableName: 'admin_activity_logs',
      underscored: true,
      timestamps: false
    }
  );

  return AdminActivityLog;
};
