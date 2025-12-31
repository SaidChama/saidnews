import { errorToJSON } from "next/dist/server/render";
import { throws } from "node:assert";

export class InternalServerError extends Error {
	readonly action: string;
	readonly status_code: number;

	constructor({ cause }: { cause?: unknown } = {}) {
		super("Um erro interno não esperado ocorreu.", {
			cause,
		});
		this.name = "InternalServerError";
		this.action = "Entre em contato com o suporte";
		this.status_code = 500;
	}
	toJSON() {
		return {
			message: this.message,
			name: this.name,
			action: this.action,
			status_code: this.status_code,
		};
	}
}
