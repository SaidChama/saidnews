import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
});

describe("infra/email.ts", () => {
	test("send()", async () => {
		const firstEmail = {
			from: "SaidNews <contato@saidnews.com.br>",
			to: "<contato@chama.dev.br>",
			subject: "Teste de assunto do Primeiro Email",
			text: "Teste de Corpo do  Primeiro Email",
		};

		const lastEmail = {
			from: "SaidNews <contato@saidnews.com.br>",
			to: "<contato@chama.dev.br>",
			subject: "Teste de assunto do Último Email",
			text: "Teste de Corpo do Último Email",
		};

		await orchestrator.deleteAllEmails();
		await email.send(firstEmail);
		await email.send(lastEmail);

		const returnedLastEmail = await orchestrator.getLastEmail();
		expect(returnedLastEmail.sender).toEqual("<contato@saidnews.com.br>");
		expect(returnedLastEmail.recipients[0]).toEqual(lastEmail.to);
		expect(returnedLastEmail.recipients[0]).toEqual(lastEmail.to);
		expect(returnedLastEmail.subject).toEqual(lastEmail.subject);
		expect(returnedLastEmail.text).toEqual(
			"Teste de Corpo do Último Email\r\n",
		);
	});
});
