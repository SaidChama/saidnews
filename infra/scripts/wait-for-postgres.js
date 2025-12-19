require("dotenv").config({ path: ".env.development" });
const { exec } = require("node:child_process");
const pgName = process.env.POSTGRES_CONTAINER_NAME;
const host = process.env.POSTGRES_HOST;

function checkPostgres() {
	exec(`docker exec ${pgName} pg_isready --host ${host}`, handleReturn);

	function handleReturn(error, stdout, stderr) {
		if (stdout.search("accepting connections") === -1) {
			process.stdout.write(".");
			checkPostgres();
			return;
		}

		console.log("\n🟢 Postgres is ready!\n");
	}
}

process.stdout.write(`\n\n🔴 Waiting for Postgres (${pgName}) to be ready...`);
checkPostgres();
