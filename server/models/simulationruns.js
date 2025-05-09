// models/simulationrun.js
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class SimulationRun extends Model {
		static associate(models) {
			SimulationRun.belongsTo(models.Scenario, {
				foreignKey: "scenario_id",
				as: "Scenario",
			});
		}
	}
	SimulationRun.init(
		{
			scenario_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: { model: "Scenarios", key: "id" },
				onDelete: "CASCADE",
			},
			results: { type: DataTypes.JSONB, allowNull: true },
			charts_updated_flag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
			chart_configs: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
			expl_param: { type: DataTypes.STRING, allowNull: true },
			expl_param2: { type: DataTypes.STRING, allowNull: true },
			exploration_flag: { type: DataTypes.INTEGER, allowNull: false },
		},
		{
			sequelize,
			modelName: "SimulationRun",
			tableName: "SimulationRuns",
			timestamps: false,
		}
	);
	return SimulationRun;
};
