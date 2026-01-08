import orchestrator from "tests/orchestrator";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
	describe("Anonymous user", () => {
		test("With incorrect 'email' but correct 'password", async () => {
			const incorrectEmailSessionUser = {
				email: "incorrectEmailSessionUser@gmail.com",
				password: "password",
			};

			const incorrectEmail = "incorrectEmail@gmail.com";
			const errorResponse = {
				name: "UnauthorizedError",
				message: "Credenciais inválidas.",
				action: "Verifique se os dados enviados estão corretos.",
				status_code: 401,
			};

			await orchestrator.createUser(incorrectEmailSessionUser);

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: incorrectEmail,
						password: incorrectEmailSessionUser.password,
					}),
				},
			);

			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With correct 'email' but incorrect 'password", async () => {
			const incorrectPasswordSessionUser = {
				email: "incorrectPasswordSessionUser@gmail.com",
				password: "password",
			};

			const incorrectPassword = "incorrectPassword";

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Credenciais inválidas.",
				action: "Verifique se os dados enviados estão corretos.",
				status_code: 401,
			};

			await orchestrator.createUser(incorrectPasswordSessionUser);

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: incorrectPasswordSessionUser.email,
						password: incorrectPassword,
					}),
				},
			);

			expect(response.status).toBe(401);

			const responseBody = await response.json();
			console.log(responseBody);

			expect(responseBody).toEqual(errorResponse);
		});
		test("With incorrect 'email' and incorrect 'password", async () => {
			const incorrectEmailPasswordSessionUser = {
				email: "incorrectEmailPasswordSessionUser@gmail.com",
				password: "password",
			};

			const incorrectEmailPassword = {
				email: "incorrectEmail@gmail.com",
				password: "incorrectPassword",
			};

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Credenciais inválidas.",
				action: "Verifique se os dados enviados estão corretos.",
				status_code: 401,
			};

			await orchestrator.createUser(incorrectEmailPasswordSessionUser);

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: incorrectEmailPassword.email,
						password: incorrectEmailPassword.password,
					}),
				},
			);

			expect(response.status).toBe(401);

			const responseBody = await response.json();
			console.log(responseBody);

			expect(responseBody).toEqual(errorResponse);
		});
	});
});
