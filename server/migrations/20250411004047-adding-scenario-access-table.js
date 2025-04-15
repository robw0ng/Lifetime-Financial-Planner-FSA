"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ScenarioAccesses", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      scenario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Scenarios",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      permission: {
        type: Sequelize.ENUM("r", "rw"),
        allowNull: false,
        defaultValue: "r",
      },
    });

    // Unique constraint to prevent duplicate user-scenario access entries
    await queryInterface.addConstraint("ScenarioAccesses", {
      fields: ["scenario_id", "user_id"],
      type: "unique",
      name: "unique_user_scenario_access",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ScenarioAccesses");

    // Drop ENUM manually to prevent type leftover
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_ScenarioAccesses_permission";'
    );
  },
};
