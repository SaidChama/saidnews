import { get } from "node:http";
import { Client, type QueryConfig, type QueryResult } from "pg";

async function query(queryObject: string | QueryConfig): Promise<QueryResult> {
	let client: Client | undefined;

	try {
		client = await getNewClient();
		const result = await client.query(queryObject);
		return result;
	} catch (error) {
		console.error("Database query error:", error);
		throw error;
	} finally {
		if (client) {
			await client.end();
		}
	}
}

async function getNewClient(): Promise<Client> {
	const client = new Client({
		host: process.env.POSTGRES_HOST,
		port: parseInt(process.env.POSTGRES_PORT),
		user: process.env.POSTGRES_USER,
		database: process.env.POSTGRES_DB,
		password: process.env.POSTGRES_PASSWORD,
		ssl: getSSLValues(),
	});

	await client.connect();
	return client;
}

export default {
	query,
	getNewClient,
};

function getSSLValues() {
	if (process.env.POSTGRES_CA) {
		return {
			ca: process.env.POSTGRES_CA,
		};
	}
	return process.env.NODE_ENV === "production" ? true : false;
}
