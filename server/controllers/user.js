const router = require("express").Router();
require("dotenv").config();
const { where } = require("sequelize");
const db = require("../models");
const multer = require("multer");
const yaml = require("js-yaml");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { User, Scenario, ScenarioAccess, Investment, InvestmentType, EventSeries, IncomeEventSeries, ExpenseEventSeries, InvestEventSeries, RebalanceEventSeries } = db;


// Fetch uploaded YAML file for the authenticated user
router.get("/get-yaml", async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json("User not authenticated");

	try {
		const foundUser = await User.findByPk(user.id, {
			attributes: ["uploaded_tax_yaml"]
		});

		if (!foundUser || !foundUser.uploaded_tax_yaml) {
			return res.status(404).json("No YAML file found");
		}

		res.status(200).json({ yaml: foundUser.uploaded_tax_yaml });
	} catch (err) {
		console.error("Failed to fetch YAML:", err.message);
		res.status(500).json("Server error while fetching YAML");
	}
});

  // Upload or replace YAML file for the authenticated user
router.post("/upload-yaml", upload.single("file"), async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json("User not authenticated");

	if (!req.file) return res.status(400).json("No file uploaded");

	try {
		const rawYaml = req.file.buffer.toString("utf-8");
		const parsedYaml = yaml.load(rawYaml); // Optional validation

		await User.update(
			{ uploaded_tax_yaml: rawYaml }, // or store parsedYaml if you prefer JSON
			{ where: { id: user.id } }
		);

		res.status(200).json("YAML file uploaded successfully");
	} catch (err) {
		console.error("YAML upload failed:", err.message);
		res.status(400).json("Invalid YAML file");
	}
});

// Remove uploaded YAML file from user's profile
router.delete("/remove-yaml", async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json("User not authenticated");

	try {
		await User.update({ uploaded_tax_yaml: null }, { where: { id: user.id } });
		res.status(200).json("YAML file removed successfully");
	} catch (err) {
		console.error("YAML removal failed:", err.message);
		res.status(500).json("Failed to remove YAML");
	}
});

module.exports = router;