import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import session from "models/session";
import setCookieParser from "set-cookie-parser";
import { error } from "node:console";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
	describe("Authenticated user", () => {
		test("With nonexistent session", async () => {
			const nonExistentToken =
				"87edcfb668896a94d06ef4d20dd773831803a71cd2f6c603905c8d749994e3612fc26cdde6ae31fb1d094cf46efe23ba";

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Usuário não possui sessão ativa.",
				action: "Verifique se o usuário está logado, e tente novamente.",
				status_code: 401,
			};

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${nonExistentToken}`,
					},
				},
			);
			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With expired session", async () => {
			const expiredSessionUser = { username: "expiredUser" };

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Usuário não possui sessão ativa.",
				action: "Verifique se o usuário está logado, e tente novamente.",
				status_code: 401,
			};

			jest.useFakeTimers({
				now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
			});

			const createdUser =
				await orchestrator.createUser(expiredSessionUser);

			const sessionObject = await orchestrator.createSession(
				createdUser.id,
			);

			jest.useRealTimers();

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${sessionObject.token}`,
					},
				},
			);
			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With valid session", async () => {
			const validSessionUser = { username: "validUser" };

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Usuário não possui sessão ativa.",
				action: "Verifique se o usuário está logado, e tente novamente.",
				status_code: 401,
			};

			const createdUser = await orchestrator.createUser(validSessionUser);

			const sessionObject = await orchestrator.createSession(
				createdUser.id,
			);

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${sessionObject.token}`,
					},
				},
			);
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: sessionObject.id,
				token: sessionObject.token,
				user_id: sessionObject.user_id,
				created_at: sessionObject.created_at.toISOString(),
				updated_at: responseBody.updated_at,
				expires_at: responseBody.expires_at,
			});
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			// Session Renewal Assertions
			console.log("AQUI FOI");

			expect(
				responseBody.expires_at <
					sessionObject.expires_at.toISOString(),
			).toBe(true);
			expect(
				responseBody.updated_at >
					sessionObject.updated_at.toISOString(),
			).toBe(true);

			// Clear-Cookie Assertions
			const parsedSetCookie = setCookieParser(response, { map: true });

			expect(parsedSetCookie.session_id).toEqual({
				name: "session_id",
				value: "invalid",
				maxAge: -1,
				path: "/",
				httpOnly: true,
			});

			// Double check Assertions
			const doubleCheckResponse = await fetch(
				"http://localhost:3000/api/v1/user",
				{
					headers: {
						Cookie: `session_id=${sessionObject.token}`,
					},
				},
			);

			expect(doubleCheckResponse.status).toBe(401);

			const doubleCheckResponseBody = await doubleCheckResponse.json();

			expect(doubleCheckResponseBody).toEqual(errorResponse);
		});
	});
});
