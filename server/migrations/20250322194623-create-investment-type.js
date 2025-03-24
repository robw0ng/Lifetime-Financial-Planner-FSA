"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("InvestmentTypes", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			description: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			expected_change_type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			expected_change_value: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			expected_change_mean: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			expected_change_std_dev: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			expense_ratio: {
				allowNull: false,
				type: Sequelize.FLOAT,
			},
			expected_income_type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			expected_income_value: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			expected_income_mean: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			expected_income_std_dev: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			taxability: {
				allowNull: false,
				type: Sequelize.STRING,
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
		await queryInterface.dropTable("InvestmentTypes");
	},
};
