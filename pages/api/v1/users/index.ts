import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import { CreateUserInput, PublicUser } from "models/user/types";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(
	request: NextApiRequest,
	response: NextApiResponse<PublicUser>,
) {
	const userInputValues = request.body as CreateUserInput;
	const newUser = await user.create(userInputValues);
	const { password, ...publicUser } = newUser;
	return response.status(201).json(publicUser);
}
