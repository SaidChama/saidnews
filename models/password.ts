import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { ConfigurationError } from "infra/errors";

async function hash(password: string): Promise<string> {
	const rounds = getNumberOfRounds();
	const hashedPassword = await bcryptjs.hash(applyPepper(password), rounds);
	return hashedPassword;
}

function getNumberOfRounds() {
	return process.env.NODE_ENV === "production" ? 14 : 4;
}

async function compare(
	providedPassword: string,
	hashedPassword: string,
): Promise<boolean> {
	const isMatch = await bcryptjs.compare(
		applyPepper(providedPassword),
		hashedPassword,
	);
	return isMatch;
}

function applyPepper(password: string): string {
	const pepper = process.env.PASSWORD_PEPPER;

	if (!pepper) {
		throw new ConfigurationError({
			message: "PASSWORD_PEPPER is not set in environment variables.",
			action: "Set a secure PASSWORD_PEPPER value in the environment variables.",
		});
	}
	return crypto.createHmac("sha256", pepper).update(password).digest("hex");
}

const password = {
	hash,
	compare,
};

export default password;
