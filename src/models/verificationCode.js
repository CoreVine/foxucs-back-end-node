const { Model } = require("sequelize");

class VerificationCode extends Model {
  static associate(models) {
    // Define associations here if needed
  }

  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        code: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        pin_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        type: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        reset_token: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true,
        },
        token_used: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        attempt_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        verify_type: {
          type: DataTypes.ENUM("phone", "email"),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "VerificationCode",
        tableName: "verification_codes",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
          {
            name: "verification_code_email_type_idx",
            fields: ["email", "type"],
          },
          {
            name: "verification_code_reset_token_idx",
            fields: ["reset_token"],
          },
          {
            name: "verification_code_expires_at_idx",
            fields: ["expires_at"],
          },
        ],
      }
    );
  }
}

module.exports = VerificationCode;