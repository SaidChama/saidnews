import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import { CreateUserInput, PublicUser } from "models/user/types";
import activation from "models/activation";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(
	request: NextApiRequest,
	response: NextApiResponse<PublicUser>,
) {
	const userInputValues = request.body as CreateUserInput;
	const newUser = await user.create(userInputValues);
	// const { password, ...publicUser } = newUser;
	// return response.status(201).json(publicUser);

	const activationToken = await activation.create(newUser.id);

	await activation.sendEmailToUser(newUser, activationToken);

	return response.status(201).json(newUser);
}
