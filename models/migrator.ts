import { runner as migrationRunner } from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";
import { ServiceError } from "infra/errors";

const defaultMigrationOptions = {
	dryRun: true,
	dir: join("infra", "migrations"),
	direction: "up" as const,
	verbose: true,
	migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
	let dbClient: any;
	try {
		dbClient = await database.getNewClient();
		const pendingMigrations = await migrationRunner({
			...defaultMigrationOptions,
			dbClient,
		});
		return pendingMigrations;
	} catch (error) {
		const pendingMigrationsError = new ServiceError({
			message:
				"Não foi possível listar as migrações pendentes no momento.",
			cause: error,
		});
		throw pendingMigrationsError;
	} finally {
		await dbClient?.end();
	}
}

async function runPendingMigrations() {
	let dbClient: any;

	try {
		dbClient = await database.getNewClient();

		const migratedMigrations = await migrationRunner({
			...defaultMigrationOptions,
			dbClient,
			dryRun: false,
		});

		return migratedMigrations;
	} catch (error) {
		const pendingMigrationsError = new ServiceError({
			message:
				"Não foi possível listar as migrações pendentes no momento.",
			cause: error,
		});
		throw pendingMigrationsError;
	} finally {
		await dbClient?.end();
	}
}

const migrator = {
	listPendingMigrations,
	runPendingMigrations,
};

export default migrator;
