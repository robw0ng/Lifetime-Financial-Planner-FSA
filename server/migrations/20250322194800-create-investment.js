"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Investments", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			special_id: {
				allowNull: false,
				unique: true,
				type: Sequelize.STRING,
			},
			value: {
				allowNull: false,
				type: Sequelize.FLOAT,
			},
			tax_status: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			investment_type_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "InvestmentTypes",
					key: "id",
				},
				onDelete: "CASCADE",
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
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Investments");
	},
};
