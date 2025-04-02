const cors = require("cors");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const { Sequelize } = require("sequelize");
const PORT = process.env.PORT || 8000;
const db = require("./models");

// TODO: any extra db config or init script
// middleware
const app = express();
app.use(
	cors({
		origin: "https://lifetime-financial-planner-a805aa154150.herokuapp.com/",
		credentials: true,
	})
);
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: false,
			maxAge: 10 * 60 * 1000,
			sameSite: "lax",
		},
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

//TODO: routing goes here
const scenarioController = require("./controllers/scenario");
const authController = require("./controllers/auth");
const eventController = require("./controllers/eventseries");
// const investmentController = require("./controllers/investment");
// const investmentTypeController = require("./controllers/investmenttype");
app.use("/scenarios", scenarioController);
app.use("/auth", authController);
app.use("/events", eventController);
// app.use("/investments", investmentController);
// app.use("/investmenttypes", investmentTypeController);

// listening
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});

app.get("/testdb", async (req, res) => {
	const users = await db.User.findAll();
	res.json(users);
  });