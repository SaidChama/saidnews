import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import { CreateUserInput, PublicUser } from "models/user/types";
import activation from "models/activation";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(
	request: NextApiRequest,
	response: NextApiResponse<PublicUser>,
) {
	const userInputValues = request.body as CreateUserInput;
	const newUser = await user.create(userInputValues);
	// const { password, ...publicUser } = newUser;
	// return response.status(201).json(publicUser);

	// 1. Croar o Token de Ativação
	// 2. Enviar esse Token de Ativação por E-mail

	await activation.sendEmailToUser(newUser);

	return response.status(201).json(newUser);
}
