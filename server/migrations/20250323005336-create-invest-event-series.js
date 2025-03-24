"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("InvestEventSeries", {
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
			is_glide_path: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
			},
			asset_allocation: {
				allowNull: false,
				type: Sequelize.JSON,
			},
			asset_allocation2: {
				allowNull: true,
				type: Sequelize.JSON,
			},
			max_cash: {
				allowNull: false,
				type: Sequelize.FLOAT,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("InvestEventSeries");
	},
};
