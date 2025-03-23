"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("EventSeries", {
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
				allowNull: true,
				type: Sequelize.STRING,
			},
			type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			start_year_type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			start_year_value: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			start_year_mean: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			start_year_std_dev: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			start_year_lower: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			start_year_upper: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			start_year_other_event: {
				allowNull: true,
				type: Sequelize.STRING,
			},
			duration_type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			duration_value: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			duration_mean: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			duration_std_dev: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			duration_lower: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			duration_upper: {
				allowNull: true,
				type: Sequelize.FLOAT,
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
		await queryInterface.dropTable("EventSeries");
	},
};
