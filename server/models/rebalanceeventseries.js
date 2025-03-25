"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class RebalanceEventSeries extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			RebalanceEventSeries.belongsTo(models.EventSeries, { foreignKey: "id" });
		}
	}
	RebalanceEventSeries.init(
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
		},
		{
			sequelize,
			modelName: "RebalanceEventSeries",
			timestamps: false,
		}
	);
	return RebalanceEventSeries;
};
