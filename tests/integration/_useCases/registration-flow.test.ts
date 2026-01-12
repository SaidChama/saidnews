import webserver from "infra/webserver";
import activation from "models/activation";
import { ac } from "node_modules/@faker-js/faker/dist/airline-CWrCIUHH";
import { act } from "react";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
	await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
	const registrationFlowUser = {
		username: "RegistrationFlow",
		email: "registration.flow@chama.dev.br",
		password: "Password@123",
	};
	let createdUserResponseBody;
	test("Create user account", async () => {
		const createdUserResponse = await fetch(
			"http://localhost:3000/api/v1/users",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(registrationFlowUser),
			},
		);

		expect(createdUserResponse.status).toBe(201);

		createdUserResponseBody = await createdUserResponse.json();

		expect(createdUserResponseBody).toEqual({
			id: createdUserResponseBody.id,
			username: registrationFlowUser.username,
			email: registrationFlowUser.email,
			password: createdUserResponseBody.password,
			features: createdUserResponseBody.features,
			created_at: createdUserResponseBody.created_at,
			updated_at: createdUserResponseBody.updated_at,
		});
	});

	test("Receive activation email", async () => {
		const lastEmail = await orchestrator.getLastEmail();

		expect(lastEmail.sender).toBe("<contato@chama.dev.br>");
		expect(lastEmail.recipients[0]).toBe(`<${registrationFlowUser.email}>`);
		expect(lastEmail.subject).toBe("Ative seu cadastro no Chama News");
		expect(lastEmail.text).toContain(registrationFlowUser.username);

		const activationTokenId = orchestrator.extractUUID(
			lastEmail.text || "",
		);

		expect(lastEmail.text).toContain(
			`${webserver.origin}/cadastro/ativar/${activationTokenId}`,
		);

		const activationTokenObject =
			await activation.findOneValidById(activationTokenId);

		expect(activationTokenObject.user_id).toBe(createdUserResponseBody.id);
		expect(activationTokenObject.used_at).toBe(null);
	});
	test("Activate account", () => {});
	test("Login", () => {});
	test("Get user information", () => {});
});
