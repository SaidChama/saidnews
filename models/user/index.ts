import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";
import { CreateUserInput, UserRecord } from "./types";

async function findOneByUsername(username: string): Promise<UserRecord> {
	const userFound = await runSelectQuery(username);
	return userFound;

	async function runSelectQuery(username: string): Promise<UserRecord> {
		const result = await database.query({
			text: `
			SELECT
				*
			FROM
				users
			WHERE
				LOWER(username) = LOWER($1)
			LIMIT
				1
			;`,
			values: [username],
		});
		await validateUserByRowCount(result.rowCount);
		return result.rows[0];
	}

	async function validateUserByRowCount(resultRowsNumber: number) {
		if (resultRowsNumber === 0) {
			throw new NotFoundError({
				message: "Usuário não encontrado.",
				action: "Verifique se o nome de usuário informado está correto.",
			});
		}
	}
}

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
	findOneByUsername,
};

export default user;
