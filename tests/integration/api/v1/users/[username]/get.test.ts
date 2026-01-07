import user from "models/user";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
	describe("Anonymous User", () => {
		test("With exact case match", async () => {
			const matchCaseUser = {
				username: "MatchCase",
				email: "MatchCase@gmail.com",
				password: "password123",
			};

			const createdUser = await orchestrator.createUser(matchCaseUser);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${matchCaseUser.username}`,
			);

			expect(response.status).toBe(200);
			const response2Body = await response.json();
			const { password, ...matchCaseUserWithoutPassword } = matchCaseUser;

			expect(response2Body).toEqual({
				// ...matchCaseUserWithoutPassword,
				...matchCaseUser,
				id: response2Body.id,
				password: response2Body.password,
				created_at: response2Body.created_at,
				updated_at: response2Body.updated_at,
			});
			expect(uuidVersion(response2Body.id)).toBe(4);
			expect(Date.parse(response2Body.created_at)).not.toBeNaN();
			expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
		});
		test("With case mismatch", async () => {
			const mismatchCaseUser = {
				username: "mismatchCase",
				email: "mismatchCase@gmail.com",
				password: "password123",
			};

			await orchestrator.createUser(mismatchCaseUser);

			const upperMismatchCaseUsername =
				mismatchCaseUser.username.toUpperCase();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${upperMismatchCaseUsername}`,
			);

			expect(response.status).toBe(200);
			const responseBody = await response.json();

			const { password, ...mismatchCaseUserWithoutPassword } =
				mismatchCaseUser;

			expect(responseBody).toEqual({
				// ...mismatchCaseUserWithoutPassword,
				...mismatchCaseUser,
				id: responseBody.id,
				password: responseBody.password,
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at,
			});
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
		});
		test("With non existent username", async () => {
			const onErrorResponse = {
				message: "Usuário não encontrado.",
				name: "NotFoundError",
				action: "Verifique se o nome de usuário informado está correto.",
				status_code: 404,
			};

			const response = await fetch(
				`http://localhost:3000/api/v1/users/nonExistentUsername`,
			);

			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody).toEqual(onErrorResponse);
		});
	});
});
