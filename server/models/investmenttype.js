"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class InvestmentType extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			InvestmentType.belongsTo(models.Scenario, { foreignKey: "scenario_id" });
			InvestmentType.hasMany(models.Investment, { foreignKey: "investment_type_id" });
		}
	}
	InvestmentType.init(
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
				allowNull: false,
			},
			expected_change_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			expected_change_value: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			expected_change_mean: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			expected_change_std_dev: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			expense_ratio: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			expected_income_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			expected_income_value: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			expected_income_mean: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			expected_income_std_dev: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			taxability: {
				type: DataTypes.STRING,
				allowNull: false,
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
			modelName: "InvestmentType",
			timestamps: false,
		}
	);
	return InvestmentType;
};
