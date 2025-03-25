"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class IncomeEventSeries extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			IncomeEventSeries.belongsTo(models.EventSeries, { foreignKey: "id" });
		}
	}
	IncomeEventSeries.init(
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: "EventSeries",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			initial_amount: {
				type: DataTypes.FLOAT,
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
			expected_change_upper: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			expected_change_lower: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			inflation_adjusted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			user_percentage: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			is_social: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "IncomeEventSeries",
			timestamps: false,
		}
	);
	return IncomeEventSeries;
};
