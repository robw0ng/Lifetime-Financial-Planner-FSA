require("dotenv").config();
const router = require("express").Router();
const db = require("../models");
const { User } = db;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// session loading
router.get("/session", (req, res) => {
	if (req.session.user) {
		res.json({ user: req.session.user });
	} else {
		res.status(401).json({ error: "Not authenticated" });
	}
});


// Validate  Google OAuth2 JWT + start session
router.post("/", async (req, res) => {
	const { token } = req.body;

	try {
		const loginTicket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = loginTicket.getPayload();
		const email = payload.email;
		const name = payload.name;

		let [user, registered] = await User.findOrCreate({
			where: { email },
			defaults: { name },
		});

		console.log("Session before login:", req.session);
		req.session.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			last_scenario_used_id: user.last_scenario_used_id,
			last_simulation_success_probability: user.last_simulation_success_probability,
			picture: payload.picture,
		};

		console.log("Session after login:", req.session);

		res.status(201).json({ 
			user: { 
				id: user.id, 
				email: user.email, 
				name: user.name,
				last_scenario_used_id: user.last_scenario_used_id,
				last_simulation_success_probability: user.last_simulation_success_probability,
				picture: payload.picture,
			}, 
			newUser: registered 
		});
	} catch (err) {
		res.status(401).json(err.message);
		console.log(err.message);
	}
});

module.exports = router;
