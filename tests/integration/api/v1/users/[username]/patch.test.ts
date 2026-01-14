import orchestrator from "tests/orchestrator";
import user from "models/user";
import passwordUtils from "models/password"; // Renamed to passwordUtils to avoid conflict with 'password' field

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
	describe("Anonymous User", () => {
		test("With unique 'username'", async () => {
			const uniqueUsernameUser = {
				username: "anonymousUniqueUsername",
			};

			const newUsername = "anonymousNewUniqueUsername";

			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: 'Verifique se o seu usuário possui a feature "update:user"',
				status_code: 403,
			};
			await orchestrator.createUser(uniqueUsernameUser);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${uniqueUsernameUser.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username: newUsername }),
				},
			);

			expect(response.status).toBe(403);
			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Authenticated User", () => {
		test("With non existent 'username'", async () => {
			const createdUser = await orchestrator.createUser();
			const activatedUser = await orchestrator.activateUser(
				createdUser.id,
			);
			const sessionObject = await orchestrator.createSession(
				activatedUser.id,
			);

			const onErrorResponse = {
				message: "Usuário não encontrado.",
				name: "NotFoundError",
				action: "Verifique se o nome de usuário informado está correto.",
				status_code: 404,
			};

			const response = await fetch(
				`http://localhost:3000/api/v1/users/nonExistentUsername`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${sessionObject.token}`,
					},
				},
			);

			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody).toEqual(onErrorResponse);
		});
		test("With duplicated 'username'", async () => {
			const duplicatedUsernameUser1 = {
				username: "authDuplicatedUsernameTest1",
			};

			const duplicatedUsernameUser2 = {
				username: "authDuplicatedUsernameTest2",
			};

			const errorResponse = {
				message: "O nome de usuário informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro nome de usuário para realizar a atualização.",
				status_code: 400,
			};

			await orchestrator.createUser(duplicatedUsernameUser1);
			const createdUser2 = await orchestrator.createUser(
				duplicatedUsernameUser2,
			);
			const activatedUser2 = await orchestrator.activateUser(
				createdUser2.id,
			);
			const sessionObject2 = await orchestrator.createSession(
				activatedUser2.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${duplicatedUsernameUser2.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${sessionObject2.token}`,
					},
					body: JSON.stringify({
						username: duplicatedUsernameUser1.username,
					}),
				},
			);

			const responseBody = await response.json();

			expect(response.status).toBe(400);
			expect(responseBody).toEqual(errorResponse);
		});
		test("With duplicated 'email'", async () => {
			const duplicatedEmailUser1 = {
				email: "authenticatedDuplicatedUserEmail1@gmail.com",
			};

			const duplicatedEmailUser2 = {
				email: "authenticatedDuplicatedUserEmail2@gmail.com",
			};

			const errorResponse = {
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro endereço de e-mail para realizar a atualização.",
				status_code: 400,
			};

			await orchestrator.createUser(duplicatedEmailUser1);

			const createdUser2 =
				await orchestrator.createUser(duplicatedEmailUser2);

			const activatedUser2 = await orchestrator.activateUser(
				createdUser2.id,
			);

			const sessionObject2 = await orchestrator.createSession(
				activatedUser2.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdUser2.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${sessionObject2.token}`,
					},
					body: JSON.stringify({ email: duplicatedEmailUser1.email }),
				},
			);

			const responseBody = await response.json();

			expect(response.status).toBe(400);
			expect(responseBody).toEqual(errorResponse);
		});
		test("With unique 'username'", async () => {
			const uniqueUsernameUser = {
				username: "authenticatedUniqueUsername",
			};

			const newUsername = "AuthenticatedNewUniqueUsername";

			const createdUser =
				await orchestrator.createUser(uniqueUsernameUser);
			const activatedUser = await orchestrator.activateUser(
				createdUser.id,
			);
			const sessionObject = await orchestrator.createSession(
				activatedUser.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${uniqueUsernameUser.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${sessionObject.token}`,
					},
					body: JSON.stringify({ username: newUsername }),
				},
			);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: newUsername,
				email: responseBody.email,
				password: responseBody.password,
				features: responseBody.features,
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at,
			});

			expect(response.status).toBe(200);
			expect(responseBody.updated_at > responseBody.created_at).toBe(
				true,
			);
		});
		test("With unique 'email'", async () => {
			const uniqueEmailUser = {
				email: "authenticatedUniqueEmail@gmail.com",
			};

			const newEmail = "newAuthenticatedUniqueEmail@gmail.com";

			const createdUser = await orchestrator.createUser(uniqueEmailUser);
			const activatedUser = await orchestrator.activateUser(
				createdUser.id,
			);
			const sessionObject = await orchestrator.createSession(
				activatedUser.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdUser.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${sessionObject.token}`,
					},
					body: JSON.stringify({ email: newEmail }),
				},
			);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: responseBody.username,
				email: newEmail,
				password: responseBody.password,
				features: responseBody.features,
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at,
			});

			expect(response.status).toBe(200);
			expect(responseBody.updated_at > responseBody.created_at).toBe(
				true,
			);
		});
		test("With new 'password'", async () => {
			const userPassword = {
				password: "password123@",
			};

			const newPassword = "newUserPassword123@";

			const createdUser = await orchestrator.createUser(userPassword);
			const activatedUser = await orchestrator.activateUser(
				createdUser.id,
			);
			const sessionObject = await orchestrator.createSession(
				activatedUser.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdUser.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${sessionObject.token}`,
					},
					body: JSON.stringify({ password: newPassword }),
				},
			);

			const responseBody = await response.json();

			expect(response.status).toBe(200);
			expect(responseBody.updated_at > responseBody.created_at).toBe(
				true,
			);

			const userPasswordInDatabase = await user.findOneByUsername(
				responseBody.username,
			);

			const correctPasswordMatch = await passwordUtils.compare(
				newPassword,
				userPasswordInDatabase.password,
			);

			const incorrectPasswordMatch = await passwordUtils.compare(
				userPassword.password,
				userPasswordInDatabase.password,
			);

			expect(correctPasswordMatch).toBe(true);
			expect(incorrectPasswordMatch).toBe(false);
		});
	});
});
