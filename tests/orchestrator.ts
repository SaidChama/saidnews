import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";
import { CreateTestUserInput, UserRecord } from "models/user/types";
import session from "models/session";
import { SessionRecord } from "models/session/types";
import activation from "models/activation";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
	await waitForWebServer();
	await waitForEmailServer();

	async function waitForWebServer() {
		return retry(fetchStatusPage, {
			retries: 100,
			maxTimeout: 1000,
		});

		async function fetchStatusPage() {
			const response = await fetch("http://localhost:3000/api/v1/status");
			if (response.status !== 200) {
				throw Error();
			}
		}
	}

	async function waitForEmailServer() {
		return retry(fetchEmailPage, {
			retries: 100,
			maxTimeout: 1000,
		});

		async function fetchEmailPage() {
			const response = await fetch(emailHttpUrl);
			if (response.status !== 200) {
				throw Error();
			}
		}
	}
}

async function clearDatabase() {
	await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
	await migrator.runPendingMigrations();
}

async function createUser(
	userObject?: CreateTestUserInput,
): Promise<UserRecord> {
	if (!userObject) {
		return await user.create({
			username: faker.internet.username().replace(/[_.0]/g, ""),
			email: faker.internet.email(),
			password: "validpassowrd",
		});
	}
	return await user.create({
		username:
			userObject.username ||
			faker.internet.username().replace(/[_.0]/g, ""),
		email: userObject.email || faker.internet.email(),
		password: userObject.password || "validpassowrd",
	});
}

async function createSession(userId: string): Promise<SessionRecord> {
	return await session.create(userId);
}

async function deleteAllEmails(): Promise<void> {
	await fetch(`${emailHttpUrl}/messages`, {
		method: "DELETE",
	});
}

async function getLastEmail() {
	const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
	const emailListBody = await emailListResponse.json();
	const lastEmailItem = emailListBody.pop();

	if (!lastEmailItem) {
		return null;
	}

	const emailTextResponse = await fetch(
		`${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
	);
	const emailTextBody = await emailTextResponse.text();

	lastEmailItem.text = emailTextBody;
	return lastEmailItem;
}

function extractUUID(text: string): string | null {
	const match = text.match(
		/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/,
	);
	return match ? match[0] : null;
}

function activateUser(inactiveUserId: string): Promise<UserRecord> {
	return activation.activateUserByUserId(inactiveUserId);
}

const orchestrator = {
	waitForAllServices,
	clearDatabase,
	runPendingMigrations,
	createUser,
	createSession,
	deleteAllEmails,
	getLastEmail,
	extractUUID,
	activateUser,
};

export default orchestrator;
