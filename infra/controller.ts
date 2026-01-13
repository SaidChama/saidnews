import * as cookie from "cookie";
import session from "models/session";
import {
	InternalServerError,
	MethodNotAllowedError,
	NotFoundError,
	ValidationError,
	UnauthorizedError,
	ForbiddenError,
} from "infra/errors";
import { NextApiRequest, NextApiResponse } from "next";
import user from "models/user";

function onNoMatchHandler(request: NextApiRequest, response: NextApiResponse) {
	const publicErrorObject = new MethodNotAllowedError();
	response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(
	error: Error,
	request: NextApiRequest,
	response: NextApiResponse,
) {
	if (
		error instanceof ValidationError ||
		error instanceof NotFoundError ||
		error instanceof ForbiddenError
	) {
		return response.status(error.statusCode).json(error);
	}
	if (error instanceof UnauthorizedError) {
		clearSessionCookie(response);
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

function clearSessionCookie(response: NextApiResponse): void {
	const setCookie = cookie.serialize("session_id", "invalid", {
		path: "/",
		maxAge: -1,
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
	});

	response.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(
	request: NextApiRequest,
	response: NextApiResponse,
	next: () => void,
) {
	if (request.cookies?.session_id) {
		await injectAuthenticatedUser(request);
		return next();
	}

	injectAnonymousUser(request);
	return next();
}

async function injectAuthenticatedUser(request: NextApiRequest) {
	const sessionToken = request.cookies.session_id;
	const sessionObject = await session.findOneValidByToken(sessionToken);
	const userObject = await user.findOneById(sessionObject.user_id);

	request.context = {
		...request.context,
		user: userObject,
	};
}

async function injectAnonymousUser(request: NextApiRequest) {
	const anonymousUserObject = {
		features: ["read:activation_token", "create:session", "create:user"],
	};

	request.context = {
		...request.context,
		user: anonymousUserObject,
	};
}

function canRequest(feature: string | string[]) {
	return function canRequestMiddleware(
		request: NextApiRequest,
		response: NextApiResponse,
		next: () => void,
	) {
		console.log("Feature: ", feature);
		console.log("request: ", request.method, request.url);
		console.log("user: ", request.context?.user);
		const userTryingToRequest = request.context.user;
		if (userTryingToRequest.features.includes(feature)) {
			return next();
		}

		throw new ForbiddenError({
			message: "Você não possui pormissão para executar esta ação.",
			action: `Verifique se o seu usuário possui a feature "${feature}"`,
		});
	};
}

const controller = {
	errorHandlers: {
		onNoMatch: onNoMatchHandler,
		onError: onErrorHandler,
	},
	setSessionCookie,
	clearSessionCookie,
	injectAnonymousOrUser,
	canRequest,
};

export default controller;
