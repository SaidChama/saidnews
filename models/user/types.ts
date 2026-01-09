export type CreateUserInput = {
	username: string;
	email: string;
	password: string;
};

// Used for testing purposes, within orchestrator
export type CreateTestUserInput = {
	username?: string;
	email?: string;
	password?: string;
};

export type UserRecord = {
	id: string;
	username: string;
	email: string;
	password: string;
	created_at: Date;
	updated_at: Date;
};

export type PublicUser = Omit<UserRecord, "password">;
