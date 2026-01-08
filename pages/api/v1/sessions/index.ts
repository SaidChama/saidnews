import { createRouter } from "next-connect";
import * as cookie from "cookie";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";
import type { NextApiRequest, NextApiResponse } from "next";
import { CreateSessionInput } from "./types";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
	const userInputValues = request.body as CreateSessionInput;

	const authenticatedUser = await authentication.getAuthenticatedUser(
		userInputValues.email,
		userInputValues.password,
	);

	const newSession = await session.create(authenticatedUser.id);

	const setCookie = cookie.serialize("session_id", newSession.token, {
		path: "/",
		maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
	});

	response.setHeader("Set-Cookie", setCookie);

	return response.status(201).json(newSession);
}
