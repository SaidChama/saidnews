import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";
import { CreateUserInput, UserRecord } from "./types";
import password from "models/password";

async function findOneById(id: string): Promise<UserRecord> {
	const userFound = await runSelectQuery(id);
	return userFound;

	async function runSelectQuery(id: string): Promise<UserRecord> {
		const result = await database.query({
			text: `
			SELECT
				*
			FROM
				users
			WHERE
				id = $1
			LIMIT
				1
			;`,
			values: [id],
		});
		await validateUserByRowCount(result.rowCount);

		return result.rows[0];
	}

	async function validateUserByRowCount(resultRowsNumber: number) {
		if (resultRowsNumber === 0) {
			throw new NotFoundError({
				message: "O id informado não foi encontrado no sistema.",
				action: "Verifique se o id informado está correto.",
			});
		}
	}
}
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
async function findOneByEmail(email: string): Promise<UserRecord> {
	const userFound = await runSelectQuery(email);
	return userFound;

	async function runSelectQuery(email: string): Promise<UserRecord> {
		const result = await database.query({
			text: `
			SELECT
				*
			FROM
				users
			WHERE
				LOWER(email) = LOWER($1)
			LIMIT
				1
			;`,
			values: [email],
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
	await validateUniqueUsername(
		userInputValues.username,
		"Utilize outro nome de usuário para realizar o cadastro.",
	);
	await validateUniqueEmail(
		userInputValues.email,
		"Utilize outro e-mail para realizar o cadastro.",
	);
	await hashPasswordInObject(userInputValues);

	const newUser = await runInsertQuery(userInputValues);

	return newUser;

	async function runInsertQuery(
		userInputValues: CreateUserInput,
	): Promise<UserRecord> {
		const results = await database.query({
			text: `
                INSERT INTO 
                    users (username, email, password) 
                VALUES 
                    ($1, $2, $3)
                RETURNING 
					*
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

async function update(
	username: string,
	userInputValues: Partial<CreateUserInput>,
): Promise<UserRecord> {
	const currentUser = await findOneByUsername(username);

	if (
		"username" in userInputValues &&
		userInputValues.username !== currentUser.username
	) {
		await validateUniqueUsername(
			userInputValues.username,
			"Utilize outro nome de usuário para realizar a atualização.",
		);
	}

	await validateUniqueEmail(
		userInputValues.email,
		"Utilize outro endereço de e-mail para realizar a atualização.",
	);

	if ("password" in userInputValues) {
		await hashPasswordInObject(userInputValues as CreateUserInput);
	}

	const userWithNewValues = {
		...currentUser,
		...userInputValues,
	};

	const updatedUser = await runUpdateQuery(userWithNewValues);

	return updatedUser;

	async function runUpdateQuery(
		userWithNewValues: UserRecord,
	): Promise<UserRecord> {
		const results = await database.query({
			text: `
				UPDATE
					users
				SET
					username = $2,
					email = $3,
					password = $4,
					updated_at = timezone('utc', now())
				WHERE
					id = $1
				RETURNING
					*
				;`,
			values: [
				userWithNewValues.id,
				userWithNewValues.username,
				userWithNewValues.email,
				userWithNewValues.password,
			],
		});
		return results.rows[0];
	}
}

async function validateUniqueUsername(username: string, action?: string) {
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
			action:
				action ?? "Utilize outro username para realizar esta operação.",
		});
	}
}

async function validateUniqueEmail(email: string, action?: string) {
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
			message: "O endereço de e-mail informado já está sendo utilizado.",
			action: action ?? "Utilize outro e-mail para realizar a operação",
		});
	}
}

async function hashPasswordInObject(userInputValues: CreateUserInput) {
	const hashedPassword = await password.hash(userInputValues.password);
	userInputValues.password = hashedPassword;
}

const user = {
	create,
	findOneById,
	findOneByUsername,
	findOneByEmail,
	update,
};

export default user;
