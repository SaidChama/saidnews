import crypto from "node:crypto";
import database from "infra/database";
import { SessionRecord } from "./types";

const EXPIRATION_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function findOneValidByToken(sessionToken: string) {
	const sessionFound = await runSelectQuery(sessionToken);

	return sessionFound;

	async function runSelectQuery(
		sessionToken: string,
	): Promise<SessionRecord | null> {
		const results = await database.query({
			text: `
				SELECT
					*
				FROM
					sessions
				WHERE
					token = $1
					AND expires_at > NOW()
				LIMIT
					1
				;`,
			values: [sessionToken],
		});
		return results.rows[0];
	}
}

async function create(userId: string) {
	const token = crypto.randomBytes(48).toString("hex");
	const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

	const newSession = await runInsertQuery(token, userId, expiresAt);
	return newSession;

	async function runInsertQuery(
		token: string,
		userId: string,
		expiresAt: Date,
	): Promise<SessionRecord> {
		const results = await database.query({
			text: `
                INSERT INTO
                    sessions (token, user_id, expires_at)
                VALUES
                    ($1, $2, $3)
                RETURNING
                    *
                ;`,
			values: [token, userId, expiresAt],
		});

		return results.rows[0];
	}
}

const session = {
	create,
	findOneValidByToken,
	EXPIRATION_IN_MILLISECONDS,
};

export default session;
