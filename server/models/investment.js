"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Investment extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Investment.belongsTo(models.InvestmentType, { foreignKey: "investment_type_id" });
			Investment.belongsTo(models.Scenario, { foreignKey: "scenario_id" });
		}
	}
	Investment.init(
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			special_id: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			value: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			tax_status: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			investment_type_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "InvestmentTypes",
					key: "id",
				},
				onDelete: "CASCADE",
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
			modelName: "Investment",
			tableName: "investments",
			timestamps: false,
		}
	);
	return Investment;
};
