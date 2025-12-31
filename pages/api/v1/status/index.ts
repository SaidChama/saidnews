import database from "infra/database";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
	try {
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
	} catch (error) {
		const publicErrorObject = new InternalServerError({ cause: error });

		console.log("\n Erro dentro do catch do controller:");
		console.error(publicErrorObject);

		response.status(500).json(publicErrorObject);
	}
}

export default status;
