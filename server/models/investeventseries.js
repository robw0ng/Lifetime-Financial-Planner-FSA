"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class InvestEventSeries extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			InvestEventSeries.belongsTo(models.EventSeries, { foreignKey: "id" });
		}
	}
	InvestEventSeries.init(
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
			is_glide_path: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			asset_allocation: {
				type: DataTypes.JSON,
				allowNull: false,
			},
			asset_allocation2: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			max_cash: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "InvestEventSeries",
			tableName: "investeventseries",
			timestamps: false,
		}
	);
	return InvestEventSeries;
};
