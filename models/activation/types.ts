export type UserActivationRecord = {
	id: string;
	used_at: Date | null;
	user_id: string;
	created_at: Date;
	expires_at: Date;
};
