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
			const user1 = {
				username: "user1",
				email: "user1@gmail.com",
				password: "password123",
			};

			const user2 = {
				username: "user2",
				email: "user2@gmail.com",
				password: "password123",
			};

			const errorResponse = {
				message: "O nome de usuário informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro nome de usuário para realizar a atualização.",
				status_code: 400,
			};

			const user1Response = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(user1),
				},
			);

			const user1ResponseBody = await user1Response.json();

			expect(user1Response.status).toBe(201);
			// const { password, ...user1WithoutPassword } = user1ResponseBody;
			expect(user1ResponseBody).toEqual({
				// ...user1WithoutPassword,
				...user1,
				id: user1ResponseBody.id,
				password: user1ResponseBody.password,
				created_at: user1ResponseBody.created_at,
				updated_at: user1ResponseBody.updated_at,
			});

			expect(uuidVersion(user1ResponseBody.id)).toBe(4);
			expect(Date.parse(user1ResponseBody.created_at)).not.toBeNaN();
			expect(Date.parse(user1ResponseBody.updated_at)).not.toBeNaN();

			const user2Response = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(user2),
				},
			);

			const user2ResponseBody = await user2Response.json();

			expect(user2Response.status).toBe(201);
			// const { password, ...user2WithoutPassword } = user2ResponseBody;
			expect(user2ResponseBody).toEqual({
				// ...user2WithoutPassword,
				...user2,
				id: user2ResponseBody.id,
				password: user2ResponseBody.password,
				created_at: user2ResponseBody.created_at,
				updated_at: user2ResponseBody.updated_at,
			});

			expect(uuidVersion(user2ResponseBody.id)).toBe(4);
			expect(Date.parse(user2ResponseBody.created_at)).not.toBeNaN();
			expect(Date.parse(user2ResponseBody.updated_at)).not.toBeNaN();

			const patchResponse = await fetch(
				`http://localhost:3000/api/v1/users/${user2.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username: user1.username }),
				},
			);

			const patchResponseBody = await patchResponse.json();

			expect(patchResponse.status).toBe(400);
			expect(patchResponseBody).toEqual(errorResponse);
		});
		test("With duplicated 'email'", async () => {
			const userEmail1 = {
				username: "userEmail1",
				email: "userEmail1@gmail.com",
				password: "password123",
			};

			const userEmail2 = {
				username: "userEmail2",
				email: "userEmail2@gmail.com",
				password: "password123",
			};

			const errorResponse = {
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro endereço de e-mail para realizar a atualização.",
				status_code: 400,
			};

			const userEmail1Response = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(userEmail1),
				},
			);

			const userEmail1ResponseBody = await userEmail1Response.json();
			expect(userEmail1Response.status).toBe(201);
			// const { password, ...userEmail1WithoutPassword } = userEmail1ResponseBody;
			expect(userEmail1ResponseBody).toEqual({
				// ...userEmail1WithoutPassword,
				...userEmail1,
				id: userEmail1ResponseBody.id,
				password: userEmail1ResponseBody.password,
				created_at: userEmail1ResponseBody.created_at,
				updated_at: userEmail1ResponseBody.updated_at,
			});

			expect(uuidVersion(userEmail1ResponseBody.id)).toBe(4);
			expect(Date.parse(userEmail1ResponseBody.created_at)).not.toBeNaN();
			expect(Date.parse(userEmail1ResponseBody.updated_at)).not.toBeNaN();

			const userEmail2Response = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(userEmail2),
				},
			);

			const userEmail2ResponseBody = await userEmail2Response.json();

			expect(userEmail2Response.status).toBe(201);
			// const { password, ...userEmail2WithoutPassword } = userEmail2ResponseBody;
			expect(userEmail2ResponseBody).toEqual({
				// ...userEmail2WithoutPassword,
				...userEmail2,
				id: userEmail2ResponseBody.id,
				password: userEmail2ResponseBody.password,
				created_at: userEmail2ResponseBody.created_at,
				updated_at: userEmail2ResponseBody.updated_at,
			});

			expect(uuidVersion(userEmail2ResponseBody.id)).toBe(4);
			expect(Date.parse(userEmail2ResponseBody.created_at)).not.toBeNaN();
			expect(Date.parse(userEmail2ResponseBody.updated_at)).not.toBeNaN();

			const patchResponse = await fetch(
				`http://localhost:3000/api/v1/users/${userEmail2.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email: userEmail1.email }),
				},
			);

			const patchResponseBody = await patchResponse.json();

			expect(patchResponse.status).toBe(400);
			expect(patchResponseBody).toEqual(errorResponse);
		});
		test("With unique 'username'", async () => {
			const uniqueUsername = {
				username: "uniqueUsername",
				email: "uniqueUsername@gmail.com",
				password: "password123",
			};

			const newUsername = "newUniqueUsername";

			const uniqueUsernameResponse = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(uniqueUsername),
				},
			);

			const uniqueUsernameResponseBody =
				await uniqueUsernameResponse.json();

			expect(uniqueUsernameResponse.status).toBe(201);
			// const { password, ...uniqueUsernameWithoutPassword } = uniqueUsernameResponseBody;
			expect(uniqueUsernameResponseBody).toEqual({
				// ...uniqueUsernameithoutPassword,
				...uniqueUsername,
				id: uniqueUsernameResponseBody.id,
				password: uniqueUsernameResponseBody.password,
				created_at: uniqueUsernameResponseBody.created_at,
				updated_at: uniqueUsernameResponseBody.updated_at,
			});

			expect(uuidVersion(uniqueUsernameResponseBody.id)).toBe(4);
			expect(
				Date.parse(uniqueUsernameResponseBody.created_at),
			).not.toBeNaN();
			expect(
				Date.parse(uniqueUsernameResponseBody.updated_at),
			).not.toBeNaN();

			const patchResponse = await fetch(
				`http://localhost:3000/api/v1/users/${uniqueUsername.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username: newUsername }),
				},
			);

			const patchResponseBody = await patchResponse.json();

			expect(patchResponseBody).toEqual({
				...uniqueUsername,
				username: newUsername,
				id: patchResponseBody.id,
				password: patchResponseBody.password,
				created_at: patchResponseBody.created_at,
				updated_at: patchResponseBody.updated_at,
			});

			expect(patchResponse.status).toBe(200);
			expect(
				patchResponseBody.updated_at > patchResponseBody.created_at,
			).toBe(true);
		});
		test("With unique 'email'", async () => {
			const uniqueEmail = {
				username: "uniqueEmail",
				email: "uniqueEmail@gmail.com",
				password: "password123",
			};

			const newEmail = "newUniqueEmail";

			const uniqueEmailResponse = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(uniqueEmail),
				},
			);

			const uniqueEmailResponseBody = await uniqueEmailResponse.json();

			expect(uniqueEmailResponse.status).toBe(201);
			// const { password, ...uniqueEmailWithoutPassword } = uniqueEmailResponseBody;
			expect(uniqueEmailResponseBody).toEqual({
				// ...uniqueEmailithoutPassword,
				...uniqueEmail,
				id: uniqueEmailResponseBody.id,
				password: uniqueEmailResponseBody.password,
				created_at: uniqueEmailResponseBody.created_at,
				updated_at: uniqueEmailResponseBody.updated_at,
			});

			expect(uuidVersion(uniqueEmailResponseBody.id)).toBe(4);
			expect(
				Date.parse(uniqueEmailResponseBody.created_at),
			).not.toBeNaN();
			expect(
				Date.parse(uniqueEmailResponseBody.updated_at),
			).not.toBeNaN();

			const patchResponse = await fetch(
				`http://localhost:3000/api/v1/users/${uniqueEmail.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email: newEmail }),
				},
			);

			const patchResponseBody = await patchResponse.json();

			expect(patchResponseBody).toEqual({
				...uniqueEmail,
				email: newEmail,
				id: patchResponseBody.id,
				password: patchResponseBody.password,
				created_at: patchResponseBody.created_at,
				updated_at: patchResponseBody.updated_at,
			});

			expect(patchResponse.status).toBe(200);
			expect(
				patchResponseBody.updated_at > patchResponseBody.created_at,
			).toBe(true);
		});
		test("With new 'password'", async () => {
			const userPassword = {
				username: "userPassword",
				email: "userPassword@gmail.com",
				password: "password123@",
			};

			const newPassword = "newUserPassword123@";

			const userPasswordResponse = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(userPassword),
				},
			);

			const userPasswordResponseBody = await userPasswordResponse.json();

			expect(userPasswordResponse.status).toBe(201);
			// const { password, ...userPasswordWithoutPassword } =
			// userPasswordResponseBody;
			expect(userPasswordResponseBody).toEqual({
				id: userPasswordResponseBody.id,
				username: userPassword.username,
				email: userPassword.email,
				password: userPasswordResponseBody.password,
				created_at: userPasswordResponseBody.created_at,
				updated_at: userPasswordResponseBody.updated_at,
			});

			expect(uuidVersion(userPasswordResponseBody.id)).toBe(4);
			expect(
				Date.parse(userPasswordResponseBody.created_at),
			).not.toBeNaN();
			expect(
				Date.parse(userPasswordResponseBody.updated_at),
			).not.toBeNaN();

			const patchResponse = await fetch(
				`http://localhost:3000/api/v1/users/${userPassword.username}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ password: newPassword }),
				},
			);

			const patchResponseBody = await patchResponse.json();

			expect(patchResponseBody).toEqual({
				username: userPassword.username,
				email: userPassword.email,
				password: patchResponseBody.password,
				id: patchResponseBody.id,
				created_at: patchResponseBody.created_at,
				updated_at: patchResponseBody.updated_at,
			});

			expect(patchResponse.status).toBe(200);
			expect(
				patchResponseBody.updated_at > patchResponseBody.created_at,
			).toBe(true);

			const userPasswordInDatabase = await user.findOneByUsername(
				userPassword.username,
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
