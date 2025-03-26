const router = require("express").Router();
require("dotenv").config();
const db = require("../models");
const { Scenario, Investment } = db;

// get all investment types for given scenario
