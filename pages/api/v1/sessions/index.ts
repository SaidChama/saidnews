import { createRouter } from "next-connect";

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

	controller.setSessionCookie(newSession.token, response);

	return response.status(201).json(newSession);
}
