import { createRouter } from "next-connect";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
	const updatedAt = new Date().toISOString();

	const dbVersionResult = await database.query({
		text: "SHOW server_version;",
	});
	const dbVersion = dbVersionResult.rows[0].server_version;

	const maxConnectionsResult = await database.query({
		text: "SHOW max_connections;",
	});
	const maxConnections = parseInt(
		maxConnectionsResult.rows[0].max_connections,
	);

	const dbName = process.env.POSTGRES_DB;
	const openedConnectionsResult = await database.query({
		text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
		values: [dbName],
	});
	const openedConnections = openedConnectionsResult.rows[0].count;

	response.status(200).json({
		updated_at: updatedAt,
		dependencies: {
			database: {
				version: dbVersion,
				max_connections: maxConnections,
				opened_connections: openedConnections,
			},
		},
	});
}
