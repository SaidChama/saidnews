/** @type {import('ts-jest').JestConfigWithTsJest} */
const nextJest = require("next/jest");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.development" });

const createJestConfig = nextJest({
	dir: ".",
});

const customJestConfig = {
	moduleDirectories: ["node_modules", "<rootDir>/"],
	testTimeout: 60000,
	transformIgnorePatterns: ["/node_modules/(?!node-pg-migrate)"],
};

module.exports = async () => {
	const nextJestConfig = await createJestConfig(customJestConfig)();
	return {
		...nextJestConfig,
		transformIgnorePatterns: [
			"/node_modules/(?!(node-pg-migrate|uuid)/)",
		],
	};
};
