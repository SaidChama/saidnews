import bcryptjs from "bcryptjs";

async function hash(password: string): Promise<string> {
	const rounds = getNumberOfRounds();
	const hashedPassword = await bcryptjs.hash(password, rounds);
	return hashedPassword;
}

function getNumberOfRounds() {
	return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(
	providedPassword: string,
	hashedPassword: string,
): Promise<boolean> {
	const isMatch = await bcryptjs.compare(providedPassword, hashedPassword);
	return isMatch;
}

const password = {
	hash,
	compare,
};

export default password;
