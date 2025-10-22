const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BlueMark extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      this.belongsTo(models.DocumentType, { foreignKey: 'document_type_id', as: 'document_type' });
    }
  }

  BlueMark.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      document_type_id: { type: DataTypes.INTEGER, allowNull: false },
      document_url: { type: DataTypes.TEXT, allowNull: false }
    },
    {
      sequelize,
      modelName: 'BlueMark',
      tableName: 'blue_marks',
      underscored: true,
      timestamps: false
    }
  );

  return BlueMark;
};