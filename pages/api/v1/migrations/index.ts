import { createRouter } from "next-connect";
import { runner as migrationRunner } from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
	dryRun: true,
	dir: join("infra", "migrations"),
	direction: "up" as const,
	verbose: true,
	migrationsTable: "pgmigrations",
};

async function getHandler(request: any, response: any) {
	let dbClient: any;
	try {
		dbClient = await database.getNewClient();
		const pendingMigrations = await migrationRunner({
			...defaultMigrationOptions,
			dbClient,
		});
		return response.status(200).json(pendingMigrations);
	} finally {
		await dbClient.end();
	}
}

async function postHandler(request: any, response: any) {
	let dbClient: any;

	try {
		dbClient = await database.getNewClient();

		const migratedMigrations = await migrationRunner({
			...defaultMigrationOptions,
			dbClient,
			dryRun: false,
		});

		if (migratedMigrations.length > 1) {
			return response.status(201).json(migratedMigrations);
		}

		return response.status(200).json(migratedMigrations);
	} finally {
		await dbClient.end();
	}
}
