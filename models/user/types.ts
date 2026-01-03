export type CreateUserInput = {
	username: string;
	email: string;
	password: string;
};

export type UserRecord = {
	id: string;
	username: string;
	email: string;
	password: string;
	created_at: string;
	updated_at: string;
};

export type PublicUser = Omit<UserRecord, "password">;
