require("dotenv").config();
module.exports = {
	development: {
		// username: process.env.DB_USER,
		// password: process.env.DB_PASS,
		// database: process.env.DB_NAME,
		// host: process.env.DB_HOST,
		// dialect: "postgres",
		// logging: true,
		use_env_variable: "DATABASE_URL",
		dialect: "postgres",
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
	},
	test: {
		// username: process.env.DB_USER,
		// password: process.env.DB_PASS,
		// database: process.env.DB_NAME,
		// host: process.env.DB_HOST,
		// dialect: "postgres",
		use_env_variable: "DATABASE_URL",
		dialect: "postgres",
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
	},
	production: {
		use_env_variable: "DATABASE_URL",
		dialect: "postgres",
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
	},
};
