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

export class ValidationError extends Error {
	readonly action: string;
	readonly statusCode: number;

	constructor({ message, action }: { message?: string; action?: string }) {
		super(message || "Erro de Validação nos Dados Enviados ocorreu");
		this.name = "ValidationError";
		this.action = action || "Ajuste os dados enviados e tente novamente.";
		this.statusCode = 400;
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

export class NotFoundError extends Error {
	readonly action: string;
	readonly statusCode: number;

	constructor({ message, action }: { message?: string; action?: string }) {
		super(message || "Recurso não encontrado.");
		this.name = "NotFoundError";
		this.action =
			action ||
			"Veririfique se os parâmetros utilizados na busca estão corretos.";
		this.statusCode = 404;
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

export class ConfigurationError extends Error {
	readonly action: string;
	readonly statusCode: number;

	constructor({ message, action }: { message?: string; action?: string }) {
		super(message || "Erro nas configurações do ambiente.");
		this.name = "ConfigurationError";
		this.action =
			action ||
			"Verifique se as configurações do ambiente estão corretas.";
		this.statusCode = 500;
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
