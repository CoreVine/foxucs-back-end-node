const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasOne(models.Profile, { foreignKey: 'user_id', as: 'profile', onDelete: 'CASCADE' });
      this.hasMany(models.SocialLogin, { foreignKey: 'user_id', as: 'social_logins', onDelete: 'CASCADE' });
      this.hasMany(models.BlueMark, { foreignKey: 'user_id', as: 'blue_marks', onDelete: 'CASCADE' });
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password_hash;
      return values;
    }

    isVerified() {
      if (this.email && this.is_email_verified) return true;
      if (this.phone_number && this.is_phone_verified) return true;
      if (this.social_logins && this.social_logins.length) return true;
      return false;
    }

    getLoginMethod() {
      if (this.social_logins && this.social_logins.length) return this.social_logins[0].provider_type;
      if (this.email && this.phone_number) return 'email_phone_password';
      if (this.email) return 'email_password';
      if (this.phone_number) return 'phone_password';
      return 'unknown';
    }
  }

  User.init(
    {
      user_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      fullname: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: true, unique: true },
      phone_number: { type: DataTypes.STRING(20), allowNull: true, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      is_email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_phone_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      blue_mark_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return User;
};