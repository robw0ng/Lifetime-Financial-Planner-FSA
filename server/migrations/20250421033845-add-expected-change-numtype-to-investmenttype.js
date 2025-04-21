"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("InvestmentTypes", "expected_change_numtype", {
			type: Sequelize.STRING,
			allowNull: false,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("InvestmentTypes", "expected_change_numtype");
	},
};
