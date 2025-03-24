"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Scenarios", {
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
			is_married: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
			},
			birth_year: {
				allowNull: false,
				type: Sequelize.INTEGER,
			},
			spouse_birth_year: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			life_expectancy_type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			life_expectancy_value: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			life_expectancy_mean: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			life_expectancy_std_dev: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			spouse_life_expectancy_type: {
				allowNull: true,
				type: Sequelize.STRING,
			},
			spouse_life_expectancy_value: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			spouse_life_expectancy_mean: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			spouse_life_expectancy_std_dev: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			inflation_assumption_type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			inflation_assumption_value: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			inflation_assumption_mean: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			inflation_assumption_std_dev: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			inflation_assumption_upper: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			inflation_assumption_lower: {
				allowNull: true,
				type: Sequelize.FLOAT,
			},
			after_tax_contribution_limit: {
				allowNull: false,
				type: Sequelize.FLOAT,
			},
			spending_strategy: {
				allowNull: false,
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			expense_withdrawl_strategy: {
				allowNull: false,
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			rmd_strategy: {
				allowNull: false,
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			is_roth_optimizer_enabled: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
			},
			roth_start_year: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			roth_end_year: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			roth_conversion_strategy: {
				allowNull: true,
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			financial_goal: {
				allowNull: false,
				type: Sequelize.FLOAT,
			},
			state_of_residence: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			user_id: {
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "CASCADE",
				type: Sequelize.INTEGER,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Scenarios");
	},
};
