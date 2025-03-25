"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Scenario extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Scenario.belongsTo(models.User, { foreignKey: "user_id" });
			Scenario.hasMany(models.InvestmentType, { foreignKey: "scenario_id" });
			Scenario.hasMany(models.Investment, { foreignKey: "scenario_id" });
			Scenario.hasMany(models.EventSeries, { foreignKey: "scenario_id" });
		}
	}
	Scenario.init(
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
			is_married: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			birth_year: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			spouse_birth_year: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			life_expectancy_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			life_expectancy_value: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			life_expectancy_mean: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			life_expectancy_std_dev: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			spouse_life_expectancy_type: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			spouse_life_expectancy_value: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			spouse_life_expectancy_mean: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			spouse_life_expectancy_std_dev: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			inflation_assumption_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			inflation_assumption_value: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			inflation_assumption_mean: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			inflation_assumption_std_dev: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			inflation_assumption_upper: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			inflation_assumption_lower: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			after_tax_contribution_limit: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			spending_strategy: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			expense_withdrawl_strategy: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			rmd_strategy: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			is_roth_optimizer_enabled: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			roth_start_year: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			roth_end_year: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			roth_conversion_strategy: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
			},
			financial_goal: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			state_of_residence: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "CASCADE",
			},
		},
		{
			sequelize,
			modelName: "Scenario",
			timestamps: false,
		}
	);
	return Scenario;
};
