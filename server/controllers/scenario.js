const scenarios = require("express").Router();

// CREATE NEW SCENARIO (WITH INVESTMENTTYPES, INVESTMENTS, AND EVENTSERIES)
scenarios.post("/", async (req, res) => {
	const {} = req.body;
	
});

module.exports = scenarios;
