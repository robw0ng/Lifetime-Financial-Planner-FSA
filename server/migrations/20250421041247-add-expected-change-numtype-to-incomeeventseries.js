"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("IncomeEventSeries", "expected_change_numtype", {
			type: Sequelize.STRING,
			allowNull: false,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("IncomeEventSeries", "expected_change_numtype");
	},
};
