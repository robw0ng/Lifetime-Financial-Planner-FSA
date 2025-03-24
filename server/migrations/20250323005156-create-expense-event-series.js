"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("ExpenseEventSeries", {
			id: {
				allowNull: false,
				primaryKey: true,
				references: {
					model: "EventSeries",
					key: "id",
				},
				onDelete: "CASCADE",
				type: Sequelize.INTEGER,
			},
			initial_amount: {
				allowNull: false,
				type: Sequelize.FLOAT,
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
			expected_change_upper: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			expected_change_lower: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			inflation_adjusted: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
			},
			user_percentage: {
				allowNull: false,
				type: Sequelize.FLOAT,
			},
			is_discretionary: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("ExpenseEventSeries");
	},
};
