import email from "infra/email";
import { UserRecord } from "models/user/types";
import { UserActivationRecord } from "./types";
import database from "infra/database";
import webserver from "infra/webserver";

const EXPIRATION_IN_MILLISECONTS = 15 * 60 * 1000; // 15 minutes

async function create(userId: string): Promise<UserActivationRecord> {
	const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONTS);

	const newToken = await runInsertQuery(userId, expiresAt);
	return newToken;

	async function runInsertQuery(
		userId: string,
		expiresAt: Date,
	): Promise<UserActivationRecord> {
		const results = await database.query({
			text: `
				INSERT INTO
					user_activation_tokens (user_id, expires_at)
				VALUES
					($1, $2)
				RETURNING
					*
				;`,
			values: [userId, expiresAt],
		});
		return results.rows[0];
	}
}
async function findOneByUserId(userId: string): Promise<UserActivationRecord> {
	const newToken = await runSelectQuery(userId);
	return newToken;

	async function runSelectQuery(
		userId: string,
	): Promise<UserActivationRecord> {
		const results = await database.query({
			text: `
				SELECT
					*
				FROM
					user_activation_tokens
				WHERE
					user_id = $1
				;`,
			values: [userId],
		});
		return results.rows[0];
	}
}
async function sendEmailToUser(
	user: UserRecord,
	activationToken: UserActivationRecord,
): Promise<void> {
	await email.send({
		from: "Chama News <contato@chama.dev.br>",
		to: `${user.email}`,
		subject: "Ative seu cadastro no Chama News",
		text: `${user.username}, clique no link abaixo para ativar seu cadastro no Chama News.
        
${webserver.origin}/cadastro/ativar/${activationToken.id}
        
Atenciosamente.
`,
	});
}

const activation = {
	create,
	sendEmailToUser,
	findOneByUserId,
};

export default activation;
