const router = require("express").Router();
const db = require("../models");
const { Scenario, Investment, InvestmentType, EventSeries } = db;

router.post("/scenarios/:id/investments", async (req, res) => {
  const { user } = req.session;
  const scenarioId = req.params.id;
  const {
    name,
    account,
    type,
    value,
    growthRate,
  } = req.body;

  if (!user) return res.status(401).json("User not authenticated");

  try {
    const scenario = await Scenario.findOne({ where: { id: scenarioId, user_id: user.id } });
    if (!scenario) return res.status(404).json("Scenario not found");

    // Step 1: Find or create the investment type
    const [investmentType] = await InvestmentType.findOrCreate({
      where: { name: type.name, scenario_id: scenario.id },
      defaults: { name: type.name, scenario_id: scenario.id },
    });

    // Step 2: Create the investment
    const investment = await Investment.create({
      scenario_id: scenario.id,
      name,
      account,
      type_id: investmentType.id,
      value,
      growthRate,
    });

    // Step 3: Refetch full updated scenario
    const fullScenario = await Scenario.findOne({
      where: { id: scenario.id },
      include: [
        { model: Investment, as: "Investments" },
        { model: InvestmentType, as: "InvestmentTypes" },
        { model: EventSeries, as: "EventSeries" },
      ],
    });

    const scenarioData = {
      ...fullScenario.toJSON(),
      investments: fullScenario.Investments,
      investmentTypes: fullScenario.InvestmentTypes,
      events: fullScenario.EventSeries,
    };
    delete scenarioData.Investments;
    delete scenarioData.InvestmentTypes;
    delete scenarioData.EventSeries;

    res.status(201).json({ scenario: scenarioData, newInvestment: investment });
  } catch (err) {
    console.error("Error creating investment:", err.message);
    res.status(500).json(err.message);
  }
});
