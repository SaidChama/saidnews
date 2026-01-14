import { createRouter } from "next-connect";

import controller from "infra/controller";
import authentication from "models/authentication";
import authorization from "models/authorization";
import session from "models/session";
import type { NextApiRequest, NextApiResponse } from "next";
import { CreateSessionInput } from "./types";
import { ForbiddenError } from "infra/errors";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:session"), postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
	const userInputValues = request.body as CreateSessionInput;

	const authenticatedUser = await authentication.getAuthenticatedUser(
		userInputValues.email,
		userInputValues.password,
	);

	if (!authorization.can(authenticatedUser, "create:session")) {
		throw new ForbiddenError({
			message: "Você não possui permissão para fazer logijn.",
			action: `Contate o suporte caso acredite que isso é um erro.`,
		});
	}

	const newSession = await session.create(authenticatedUser.id);

	controller.setSessionCookie(newSession.token, response);

	return response.status(201).json(newSession);
}

async function deleteHandler(
	request: NextApiRequest,
	response: NextApiResponse,
) {
	const sessionToken = request.cookies.session_id;

	const sessionObject = await session.findOneValidByToken(sessionToken);
	const expiredSession = await session.expireById(sessionObject.id);
	controller.clearSessionCookie(response);

	return response.status(200).json(expiredSession);
}
