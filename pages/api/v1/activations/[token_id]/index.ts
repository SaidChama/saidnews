import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import { NextApiRequest, NextApiResponse } from "next";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(
	request: NextApiRequest,
	response: NextApiResponse,
) {
	const activationTokenId = request.query.token_id as string;

	const validActivationToken =
		await activation.findOneValidById(activationTokenId);

	const usedActivationToken =
		await activation.markTokenAsUsed(activationTokenId);

	await activation.activateUserByUserId(validActivationToken.user_id);

	return response.status(200).json(usedActivationToken);
}
