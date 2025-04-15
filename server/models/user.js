"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// A user owns many scenarios directly
			User.hasMany(models.Scenario, {
			  foreignKey: "user_id",
			  as: "OwnedScenarios",
			  onDelete: "CASCADE",
			  hooks: true,
			});
		  
			// A user can also access many shared scenarios
			User.belongsToMany(models.Scenario, {
			  through: models.ScenarioAccess,
			  foreignKey: "user_id",
			  otherKey: "scenario_id",
			  as: "SharedScenarios",
			});
		  }
		}
	User.init(
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
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					isEmail: true,
				},
			},
			uploaded_tax_yaml: {
				type: DataTypes.TEXT,
				allowNull: true,
			}			  
		},
		{
			sequelize,
			modelName: "User",
			timestamps: false,
		}
	);
	return User;
};
