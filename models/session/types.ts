export type CreateTestUserInput = {
	username?: string;
	email?: string;
	password?: string;
};

export type SessionRecord = {
	id: string;
	token: string;
	user_id: string;
	expires_at: Date;
	created_at: Date;
	updated_at: Date;
};
