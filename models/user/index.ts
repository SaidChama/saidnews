import database from "infra/database";
import { ValidationError } from "infra/errors";
import { CreateUserInput, UserRecord } from "./types";

async function create(userInputValues: CreateUserInput): Promise<UserRecord> {
	await validateUniqueUsername(userInputValues.username);
	await validateUniqueEmail(userInputValues.email);

	const newUser = await runInsertQuery(userInputValues);
	return newUser;

	async function validateUniqueUsername(username: string) {
		const results = await database.query({
			text: `
                SELECT 
                    username
                FROM
                    users
                WHERE
                    LOWER(username) = LOWER($1)
                ;`,
			values: [username],
		});

		if (results.rowCount > 0) {
			throw new ValidationError({
				message: "O nome de usuário informado já está sendo utilizado.",
				action: "Utilize outro nome de usuário para realizar o cadastro.",
			});
		}
	}

	async function validateUniqueEmail(email: string) {
		const results = await database.query({
			text: `
                SELECT 
                    email
                FROM
                    users
                WHERE
                    LOWER(email) = LOWER($1)
                ;`,
			values: [email],
		});

		if (results.rowCount > 0) {
			throw new ValidationError({
				message: "O e-mail informado já está sendo utilizado.",
				action: "Utilize outro e-mail para realizar o cadastro.",
			});
		}
	}

	async function runInsertQuery(
		userInputValues: CreateUserInput,
	): Promise<UserRecord> {
		const results = await database.query({
			text: `
                INSERT INTO 
                    users (username, email, password) 
                VALUES 
                    ($1, $2, $3)
                RETURNING *
                ;`,
			values: [
				userInputValues.username,
				userInputValues.email,
				userInputValues.password,
			],
		});
		return results.rows[0];
	}
}

const user = {
	create,
};

export default user;
