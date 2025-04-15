"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ScenarioAccess extends Model {
    static associate(models) {
      ScenarioAccess.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "User", // alias used in includes
      });
    
      ScenarioAccess.belongsTo(models.Scenario, {
        foreignKey: "scenario_id",
        as: "Scenario", // alias used in includes
      });
    }
  }

  ScenarioAccess.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      scenario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Scenarios", key: "id" },
        onDelete: "CASCADE",
      },
      permission: {
        type: DataTypes.ENUM("r", "rw"),
        allowNull: false,
        defaultValue: "r",
      },
    },
    {
      sequelize,
      modelName: "ScenarioAccess",
      tableName: "ScenarioAccesses",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "scenario_id"],
        },
      ],
    }
  );

  return ScenarioAccess;
};
