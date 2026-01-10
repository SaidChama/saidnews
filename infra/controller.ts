import * as cookie from "cookie";
import session from "models/session";
import {
	InternalServerError,
	MethodNotAllowedError,
	NotFoundError,
	ValidationError,
	UnauthorizedError,
} from "infra/errors";
import { NextApiResponse } from "next";

function onNoMatchHandler(request: any, response: any) {
	const publicErrorObject = new MethodNotAllowedError();
	response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error: any, request: any, response: any) {
	if (
		error instanceof ValidationError ||
		error instanceof NotFoundError ||
		error instanceof UnauthorizedError
	) {
		return response.status(error.statusCode).json(error);
	}

	const publicErrorObject = new InternalServerError({
		cause: error,
	});

	console.error(publicErrorObject);

	response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function setSessionCookie(
	sessionToken: string,
	response: NextApiResponse,
): void {
	const setCookie = cookie.serialize("session_id", sessionToken, {
		path: "/",
		maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
	});

	response.setHeader("Set-Cookie", setCookie);
}

const controller = {
	errorHandlers: {
		onNoMatch: onNoMatchHandler,
		onError: onErrorHandler,
	},
	setSessionCookie,
};

export default controller;
