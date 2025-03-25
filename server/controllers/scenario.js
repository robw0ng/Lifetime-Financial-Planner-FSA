require("dotenv").config();
const router = require("express").Router();
const db = require("../models");
const { Scenario, Investment, InvestmentType, EventSeries } = db;

// CREATE NEW SCENARIO (WITH INVESTMENTTYPES, INVESTMENTS, AND EVENTSERIES)
router.post("/", async (req, res) => {
	// 	const {} = req.body;
	// 	try {
	// 		// Step 1: Create the Scenario
	// 		const newScenario = await Scenario.create();
	// 		// Step 2: Manually set the `scenario_id` for each investment type
	// 		const investmentTypesWithFKey = .map((invType) => ({
	// 			...invType,
	// 			scenario_id: newScenario.id, // Linking the investment type to the scenario
	// 		}));
	// 		// Step 3: Bulk create investment types with the scenario_id
	// 		const createdInvestmentTypes = await InvestmentType.bulkCreate(investmentTypesWithFKey);
	// 		// Step 4: Create a lookup map from investment type names to their IDs
	//         invTypeMap = {};
	//         for (let invType of createdInvestmentTypes) {
	//             invTypeMap[invType.name] = invType.id;
	//         }
	// 		// Step 5: Manually set the `scenario_id` and `investment_type_id` for each investment
	// 		const investmentsWithFKey= .map((inv) => ({
	// 			...inv,
	//             special_id: inv.type + " " + inv.tax_status,
	// 			scenario_id: newScenario.id, // Linking the investment to the scenario
	// 			investment_type_id: invTypeMap[inv.type], // Linking the investment to the correct investment type ID
	// 		}));
	// 		// Step 6: Bulk create investments with foreign keys
	// 		await Investment.bulkCreate(investmentsWithFKey);
	// 		// Step 7: Manually set the `scenario_id` for each event
	// 		const eventSeriesWithFKey= .map((ev) => ({
	// 			...ev,
	// 			scenario_id: newScenario.id, // Linking the event to the scenario
	// 		}));
	// 		// Step 8: Bulk create events with the scenario_id
	// 		const createdEventSeries = await EventSeries.bulkCreate(eventSeriesWithFKey);
	// 		// Step 9: Loop through created events and based on type, create IncomeEvent, ExpenseEvent, InvestEvent, RebalanceEvent
	// 		for (let ev of createdEventSeries) {
	// 			if (ev.type === "income") {
	// 				const eventData = ;
	// 				await IncomeEventSeries.create({
	// 					id: ev.id, // Use the `event_id` as the primary key
	// 					...
	// 				});
	// 			} else if (ev.type === "expense") {
	// 				const eventData = ;
	// 				await ExpenseEventSeries.create({
	// 					id: ev.id, // Use the `event_id` as the primary key
	// 					...
	// 				});
	// 			} else if (ev.type === "invest") {
	// 				const eventData = ;
	// 				await InvestEventSeries.create({
	// 					id: ev.id, // Use the `event_id` as the primary key
	// 					...
	// 				});
	// 			}
	//             else if (ev.type === "rebalance") {
	// 				const eventData = ;
	// 				await RebalanceEventSeries.create({
	// 					id: ev.id, // Use the `event_id` as the primary key
	// 					...
	// 				});
	// 			}
	// 		}
	// 		// Step 10: Return the created Scenario object (or send any other relevant data)
	// 		res.status(201).json(newScenario);
	// 	} catch (err) {
	// 		res.status(500).json(err.message);
	//      console.log(err.message);
	// 	}
});

module.exports = router;
