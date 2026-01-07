import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "models/user";
import passwordUtils from "models/password"; // Renamed to passwordUtils to avoid conflict with 'password' field

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
	describe("Anonymous User", () => {
		test("With non existent 'username'", async () => {
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
						"Content-Type": "application/json",
					},
				},
			);

			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody).toEqual(onErrorResponse);
		});
		test("With duplicated 'username'", async () => {
			const duplicatedUsernameUser1 = {
				username: "duplicatedUsernameTest1",
			};

			const duplicatedUsernameUser2 = {
				username: "duplicatedUsernameTest2",
			};

			const errorResponse = {
				message: "O nome de usuário informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro nome de usuário para realizar a atualização.",
				status_code: 400,
			};

			await orchestrator.createUser(duplicatedUsernameUser1);
			await orchestrator.createUser(duplicatedUsernameUser2);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${duplicatedUsernameUser2.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
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
				email: "userEmail1@gmail.com",
			};

			const duplicatedEmailUser2 = {
				email: "userEmail2@gmail.com",
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

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdUser2.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
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
				username: "uniqueUsername",
			};

			const newUsername = "newUniqueUsername";

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

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: newUsername,
				email: responseBody.email,
				password: responseBody.password,
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
				email: "uniqueEmail@gmail.com",
			};

			const newEmail = "newUniqueEmail";

			const createdUser = await orchestrator.createUser(uniqueEmailUser);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdUser.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
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

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdUser.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
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
