"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class EventSeries extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			EventSeries.belongsTo(models.Scenario, { foreignKey: "scenario_id", as: "Scenario",});
			EventSeries.hasOne(models.IncomeEventSeries, { foreignKey: "id" });
			EventSeries.hasOne(models.ExpenseEventSeries, { foreignKey: "id" });
			EventSeries.hasOne(models.InvestEventSeries, { foreignKey: "id" });
			EventSeries.hasOne(models.RebalanceEventSeries, { foreignKey: "id" });
		}
	}
	EventSeries.init(
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			start_year_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			start_year_value: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			start_year_mean: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			start_year_std_dev: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			start_year_lower: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			start_year_upper: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			start_year_other_event: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			duration_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			duration_value: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			duration_mean: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			duration_std_dev: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			duration_lower: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			duration_upper: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			scenario_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Scenarios",
					key: "id",
				},
				onDelete: "CASCADE",
			},
		},
		{
			sequelize,
			modelName: "EventSeries",
			timestamps: false,
		}
	);
	return EventSeries;
};
