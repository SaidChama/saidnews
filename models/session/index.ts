import crypto from "node:crypto";
import database from "infra/database";
import { SessionRecord } from "./types";
import { UnauthorizedError } from "infra/errors";

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

		validateSessionByRowCount(results.rowCount);

		return results.rows[0];
		function validateSessionByRowCount(resultRowsNumber: number) {
			if (resultRowsNumber === 0) {
				throw new UnauthorizedError({
					message: "Usuário não possui sessão ativa.",
					action: "Verifique se o usuário está logado, e tente novamente.",
				});
			}
		}
	}
}

async function create(userId: string) {
	const token = crypto.randomBytes(48).toString("hex");
	const expiresAt = calculateExpirationDate();

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

async function renew(sessionId: string): Promise<SessionRecord> {
	const expiresAt = calculateExpirationDate();
	const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);
	return renewedSessionObject;

	async function runUpdateQuery(
		sessionId: string,
		expiresAt: Date,
	): Promise<SessionRecord> {
		const results = await database.query({
			text: `
				UPDATE
					sessions
				SET
					expires_at = $2,
					updated_at = NOW()
				WHERE
					id = $1
				RETURNING
					*
				;`,
			values: [sessionId, expiresAt],
		});

		return results.rows[0];
	}
}

function calculateExpirationDate() {
	return new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
}

const session = {
	create,
	findOneValidByToken,
	renew,
	EXPIRATION_IN_MILLISECONDS,
};

export default session;
