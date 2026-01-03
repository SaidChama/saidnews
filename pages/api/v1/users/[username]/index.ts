import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
	const username = request.query.username;
	const userRecord = await user.findOneByUsername(username as string);
	// const { password, ...publicUserRecord } = userRecord;
	// return response.status(200).json(publicUserRecord);
	return response.status(200).json(userRecord);
}
