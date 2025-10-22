const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SocialLogin extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }

    toJSON() {
      const v = { ...this.get() };
      delete v.provider_token;
      return v;
    }
  }

  SocialLogin.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      provider_type: { type: DataTypes.STRING(50), allowNull: false },
      provider_token: { type: DataTypes.TEXT, allowNull: false }
    },
    {
      sequelize,
      modelName: 'SocialLogin',
      tableName: 'social_logins',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [{ unique: true, fields: ['user_id', 'provider_type'] }]
    }
  );

  return SocialLogin;
};