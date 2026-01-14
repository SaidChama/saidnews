import email from "infra/email";
import { UserRecord } from "models/user/types";
import { UserActivationRecord } from "./types";
import database from "infra/database";
import webserver from "infra/webserver";
import user from "models/user";
import authorization from "models/authorization";
import { ForbiddenError, NotFoundError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 15 * 60 * 1000; // 15 minutes

async function findOneValidById(tokenId: string) {
	const activationTokenObject = await runSelectQuery(tokenId);

	return activationTokenObject;

	async function runSelectQuery(tokenId: string) {
		const results = await database.query({
			text: `
				SELECT
					*
				FROM
					user_activation_tokens
				WHERE
					id = $1
					AND expires_at > NOW()
					AND used_at IS NULL
				LIMIT 1
			;`,
			values: [tokenId],
		});
		if (results.rowCount === 0) {
			throw new NotFoundError({
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
			});
		}
		return results.rows[0];
	}
}
async function create(userId: string): Promise<UserActivationRecord> {
	const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

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
async function markTokenAsUsed(
	activationTokenId: string,
): Promise<UserActivationRecord> {
	const usedActivationToken = await runUpdateQuery(activationTokenId);
	return usedActivationToken;

	async function runUpdateQuery(
		activationTokenId: string,
	): Promise<UserActivationRecord> {
		const results = await database.query({
			text: `
				UPDATE
					user_activation_tokens
				SET
					used_at = timezone('UTC', now()),
					updated_at = timezone('UTC', now())
				WHERE
					id = $1
				RETURNING
					*
			;`,
			values: [activationTokenId],
		});
		return results.rows[0];
	}
}
async function activateUserByUserId(userId: string): Promise<UserRecord> {
	const userToActivate = await user.findOneById(userId);

	if (!authorization.can(userToActivate, "read:activation_token")) {
		throw new ForbiddenError({
			message: "Você não pode mais utilizar tokens de ativação",
			action: "Entre em contato com o suporte.",
		});
	}

	const activatedUser = await user.setFeatures(userId, [
		"create:session",
		"read:session",
		"update:user",
	]);
	return activatedUser;
}

const activation = {
	create,
	sendEmailToUser,
	findOneValidById,
	markTokenAsUsed,
	activateUserByUserId,
	EXPIRATION_IN_MILLISECONDS,
};

export default activation;
