const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DocumentType extends Model {
    static associate(models) {
      this.hasMany(models.BlueMark, { foreignKey: 'document_type_id', as: 'blue_marks' });
    }
  }

  DocumentType.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false }
    },
    {
      sequelize,
      modelName: 'DocumentType',
      tableName: 'document_types',
      underscored: true,
      timestamps: false
    }
  );

  return DocumentType;
};