import orchestrator from "tests/orchestrator";
import database from "infra/database";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
	describe("Anonymous User", () => {
		test("With unique and valid data", async () => {
			const user = {
				username: "johndoe",
				email: "johndoe@gmail.com",
				password: "password123",
			};

			const response = await fetch("http://localhost:3000/api/v1/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(user),
			});

			const responseBody = await response.json();

			expect(response.status).toBe(201);
			const { password, ...userWithoutPassword } = responseBody;
			expect(responseBody).toEqual({
				...userWithoutPassword,
				id: responseBody.id,
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
		});
		test("With duplicated 'username'", async () => {
			const duplicatedUsername1 = {
				username: "duplicatedUsername",
				email: "duplicatedUsername1@gmail.com",
				password: "password123",
			};

			const duplicatedUsername2 = {
				username: "duplicatedUsername",
				email: "duplicatedUsername2@gmail.com",
				password: "password123",
			};

			const errorResponse = {
				message: "O nome de usuário informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro nome de usuário para realizar o cadastro.",
				status_code: 400,
			};

			const response1 = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(duplicatedUsername1),
				},
			);

			const response1Body = await response1.json();

			expect(response1.status).toBe(201);
			const { password, ...duplicatedUsername1WithoutPassword } =
				response1Body;
			expect(response1Body).toEqual({
				...duplicatedUsername1WithoutPassword,
				id: response1Body.id,
				created_at: response1Body.created_at,
				updated_at: response1Body.updated_at,
			});

			expect(uuidVersion(response1Body.id)).toBe(4);
			expect(Date.parse(response1Body.created_at)).not.toBeNaN();
			expect(Date.parse(response1Body.updated_at)).not.toBeNaN();

			const response2 = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(duplicatedUsername2),
				},
			);

			const response2Body = await response2.json();
			expect(response2Body).toEqual(errorResponse);
			expect(response2.status).toBe(400);
		});
		test("With duplicated 'email'", async () => {
			const duplicatedEmailUser1 = {
				username: "duplicatedEmail1",
				email: "duplicated@gmail.com",
				password: "password123",
			};

			const duplicatedEmailUser2 = {
				username: "duplicatedEmail2",
				email: "Duplicated@gmail.com",
				password: "password123",
			};

			const errorResponse = {
				message: "O e-mail informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro e-mail para realizar o cadastro.",
				status_code: 400,
			};

			const response1 = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(duplicatedEmailUser1),
				},
			);

			const response1Body = await response1.json();

			expect(response1.status).toBe(201);
			const { password, ...duplicatedEmailUser1WithoutPassword } =
				response1Body;
			expect(response1Body).toEqual({
				...duplicatedEmailUser1WithoutPassword,
				id: response1Body.id,
				created_at: response1Body.created_at,
				updated_at: response1Body.updated_at,
			});

			expect(uuidVersion(response1Body.id)).toBe(4);
			expect(Date.parse(response1Body.created_at)).not.toBeNaN();
			expect(Date.parse(response1Body.updated_at)).not.toBeNaN();

			const response2 = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(duplicatedEmailUser2),
				},
			);

			const response2Body = await response2.json();
			expect(response2Body).toEqual(errorResponse);
			expect(response2.status).toBe(400);
		});
	});
});
