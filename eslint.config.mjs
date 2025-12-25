import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import jest from "eslint-plugin-jest";

export default defineConfig([
	...nextVitals,

	globalIgnores([
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",

		"infra/**",
		"migrations/**",
	]),

	// Jest recomendado só em testes
	{
		files: ["**/*.test.*", "**/*.spec.*"],
		plugins: { jest },
		rules: {
			...jest.configs.recommended.rules,
		},
	},
]);
