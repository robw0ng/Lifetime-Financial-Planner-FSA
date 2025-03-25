const cors = require("cors");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const { Sequelize } = require("sequelize");

// TODO: any extra db config or init script
// middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: { httpOnly: true, secure: false },
	})
);
app.use(passport.initialize());
app.use(passport.session());

//TODO: routing goes here
const scenarioController = require("./controllers/scenario");
const authController = require("./controllers/auth");
app.use("/scenarios", scenarioController);
app.use("/auth", authController);

// listening
app.listen(8000, () => {
	console.log("Server started on port 8000");
});
