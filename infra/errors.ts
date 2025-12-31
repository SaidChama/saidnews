import { errorToJSON } from "next/dist/server/render";
import { throws } from "node:assert";

export class InternalServerError extends Error {
	readonly action: string;
	readonly statusCode: number;

	constructor({
		cause,
		statusCode,
	}: { cause?: unknown; statusCode?: any } = {}) {
		super("Um erro interno não esperado ocorreu.", {
			cause,
		});
		this.name = "InternalServerError";
		this.action = "Entre em contato com o suporte";
		this.statusCode = statusCode || 500;
	}
	toJSON() {
		return {
			message: this.message,
			name: this.name,
			action: this.action,
			status_code: this.statusCode,
		};
	}
}

export class ServiceError extends Error {
	readonly action: string;
	readonly statusCode: number;

	constructor({
		cause,
		message,
	}: { cause?: unknown; message?: string } = {}) {
		super(message || "Serviço Indisponível no Momento", {
			cause,
		});
		this.name = "ServiceError";
		this.action = "Verifique se o Serviço está disponível.";
		this.statusCode = 503;
	}
	toJSON() {
		return {
			message: this.message,
			name: this.name,
			action: this.action,
			status_code: this.statusCode,
		};
	}
}

export class MethodNotAllowedError extends Error {
	readonly action: string;
	readonly statusCode: number;

	constructor() {
		super("Método não permitido para este endpoint.");
		this.name = "MethodNotAllowedError";
		this.action =
			"Verifique se o método HTTP enviado é válido para este endpoint.";
		this.statusCode = 405;
	}
	toJSON() {
		return {
			message: this.message,
			name: this.name,
			action: this.action,
			status_code: this.statusCode,
		};
	}
}
