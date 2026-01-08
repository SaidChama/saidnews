import user from "models/user";
import password from "models/password";
import { NotFoundError, UnauthorizedError } from "infra/errors";
import { CreateSessionInput } from "pages/api/v1/sessions/types";

async function getAuthenticatedUser(
	providedEmail: string,
	providedPassword: string,
) {
	try {
		const storedUser = await findUserByEmail(providedEmail);
		await validatePassword(providedPassword, storedUser.password);

		return storedUser;
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			throw new UnauthorizedError({
				message: "Credenciais inválidas.",
				action: "Verifique se os dados enviados estão corretos.",
			});
		}

		throw error;
	}

	async function findUserByEmail(
		providedEmail: string,
	): Promise<CreateSessionInput> {
		let storedUser: CreateSessionInput;
		try {
			storedUser = await user.findOneByEmail(providedEmail);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw new UnauthorizedError({
					message: "Email incorreto.",
					action: "Verifique se o email enviado está correto.",
				});
			}
			throw error;
		}
		return storedUser;
	}

	async function validatePassword(
		providedPassword: string,
		storedUserPassword: string,
	) {
		const correctPasswordMatch = await password.compare(
			providedPassword,
			storedUserPassword,
		);

		if (!correctPasswordMatch) {
			throw new UnauthorizedError({
				message: "Senha incorreta.",
				action: "Verifique se a senha enviada está correta.",
			});
		}
	}
}

const authentication = {
	getAuthenticatedUser,
};

export default authentication;
