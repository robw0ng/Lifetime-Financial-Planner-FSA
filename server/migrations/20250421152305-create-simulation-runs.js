"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("SimulationRuns", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			scenario_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: "Scenarios", key: "id" },
				onDelete: "CASCADE",
			},
			// store the entire batch-of-simulations as JSONB
			results: {
				type: Sequelize.JSONB,
				allowNull: true,
			},
			charts_updated_flag: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
			chart_configs: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true },
			// optional: record which parameter was explored
			expl_param: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("SimulationRuns");
	},
};
