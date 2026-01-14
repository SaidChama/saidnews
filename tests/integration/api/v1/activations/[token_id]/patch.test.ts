import { version as uuidVersion } from "uuid";
import activation from "models/activation";
import user from "models/user";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/activations/[token_id]", () => {
	describe("Anonymous user", () => {
		test("With nonexistent token", async () => {
			const tokenId = "027bcdb0-43d9-41f7-bfdd-72e2643059bd";

			const errorResponse = {
				name: "NotFoundError",
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
				status_code: 404,
			};

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${tokenId}`,
				{
					method: "PATCH",
				},
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();
			expect(responseBody).toEqual(errorResponse);
		});
		test("With expired token", async () => {
			const expiredTokenUser = {
				username: "expiredTokenUser",
				email: "expiredTokenEmail@gmail.com",
			};

			const errorResponse = {
				name: "NotFoundError",
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
				status_code: 404,
			};
			jest.useFakeTimers({
				now: new Date(
					Date.now() - activation.EXPIRATION_IN_MILLISECONDS,
				),
			});

			const createdUser = await orchestrator.createUser(expiredTokenUser);
			const expiredActivationToken = await activation.create(
				createdUser.id,
			);

			jest.useRealTimers();

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${expiredActivationToken.id}`,
				{
					method: "PATCH",
				},
			);

			const responseBody = await response.json();

			expect(response.status).toBe(404);

			expect(responseBody).toEqual(errorResponse);
		});
		test("With already used token", async () => {
			const expiredTokenUser = {
				username: "alreadyUsedTokenUser",
				email: "alreadyUsedTokenEmail@gmail.com",
			};

			const errorResponse = {
				name: "NotFoundError",
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
				status_code: 404,
			};

			const createdUser = await orchestrator.createUser(expiredTokenUser);
			const activationToken = await activation.create(createdUser.id);

			const response1 = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
				},
			);

			expect(response1.status).toBe(200);

			const response2 = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
				},
			);
			expect(response2.status).toBe(404);
			const response2Body = await response2.json();
			expect(response2Body).toEqual(errorResponse);
		});
		test("With valid token", async () => {
			const validTokenUser = {
				username: "validTokenUser",
				email: "validTokenEmail@gmail.com",
			};

			const createdUser = await orchestrator.createUser(validTokenUser);

			const activationToken = await activation.create(createdUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: activationToken.id,
				used_at: responseBody.used_at,
				user_id: activationToken.user_id,
				expires_at: activationToken.expires_at.toISOString(),
				created_at: activationToken.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(uuidVersion(responseBody.user_id)).toBe(4);

			expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.used_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			const expiresAt = new Date(responseBody.expires_at);
			const createdAt = new Date(responseBody.created_at);

			expiresAt.setMilliseconds(0);
			createdAt.setMilliseconds(0);

			expect(expiresAt.getTime() - createdAt.getTime()).toBe(
				activation.EXPIRATION_IN_MILLISECONDS,
			);

			const activatedUser = await user.findOneById(responseBody.user_id);
			expect(activatedUser.features).toEqual([
				"create:session",
				"read:session",
			]);
		});
		test("With valid token but already activated user", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não pode mais utilizar tokens de ativação",
				action: "Entre em contato com o suporte.",
				status_code: 403,
			};

			const createdUser = await orchestrator.createUser();
			await orchestrator.activateUser(createdUser.id);
			const activationToken = await activation.create(createdUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Authenticated user", () => {
		test("With valid token, but already logged in user", async () => {
			const errorResponse = {
				message: "Você não possui permissão para executar esta ação.",
				name: "ForbiddenError",
				action: 'Verifique se o seu usuário possui a feature "read:activation_token"',
				status_code: 403,
			};

			const user1 = await orchestrator.createUser();
			const activatedUser1 = await orchestrator.activateUser(user1.id);
			const user1SessionObject = await orchestrator.createSession(
				activatedUser1.id,
			);

			const user2 = await orchestrator.createUser();
			const user2ActivationToken = await activation.create(user2.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${user2ActivationToken.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${user1SessionObject.token}`,
					},
				},
			);

			const responseBody = await response.json();

			expect(response.status).toBe(403);

			expect(responseBody).toEqual(errorResponse);
		});
	});
});
