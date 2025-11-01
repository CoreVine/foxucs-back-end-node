const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
      // no associations for now
    }
  }

  Banner.init(
    {
      title: { type: DataTypes.STRING(100), allowNull: false },
      url: { type: DataTypes.STRING(255), allowNull: true },
      image_url: { type: DataTypes.STRING(1024), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      order: { type: DataTypes.INTEGER, allowNull: true }
    },
    {
      sequelize,
      modelName: 'Banner',
      tableName: 'banners',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Banner;
};
