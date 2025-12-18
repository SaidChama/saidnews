import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
	const dbClient = await database.getNewClient();

	const defaultMigrationOptions = {
		dbClient: dbClient,
		dryRun: true,
		dir: join("infra", "migrations"),
		direction: "up" as const,
		verbose: true,
		migrationsTable: "pgmigrations",
	};

	if (request.method === "GET") {
		const pendingMigrations = await migrationRunner(
			defaultMigrationOptions,
		);
		await dbClient.end();

		response.status(200).json(pendingMigrations);
	}

	if (request.method === "POST") {
		const migratedMigrations = await migrationRunner({
			...defaultMigrationOptions,
			dryRun: false,
		});

		if (migratedMigrations.length > 1) {
			response.status(201).json(migratedMigrations);
		}
		await dbClient.end();

		response.status(200).json(migratedMigrations);
	}

	if (request.method === "DELETE") {
		response.status(200).json({ message: "DELETE HERE" });
	}

	return response.status(405).end();
}
