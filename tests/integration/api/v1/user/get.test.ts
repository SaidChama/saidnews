import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
	describe("Default user", () => {
		test("With valid session", async () => {
			const validSessionUser = { username: "validUser" };
			const createdUser = await orchestrator.createUser(validSessionUser);

			const sessionObject = await orchestrator.createSession(
				createdUser.id,
			);

			const response = await fetch("http://localhost:3000/api/v1/user", {
				headers: {
					Cookie: `session_id=${sessionObject.token}`,
				},
			});
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdUser.id,
				username: validSessionUser.username,
				email: createdUser.email,
				password: createdUser.password,
				created_at: createdUser.created_at.toISOString(),
				updated_at: createdUser.updated_at.toISOString(),
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
		});
	});
});
