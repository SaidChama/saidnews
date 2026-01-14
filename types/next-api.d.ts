import type { NextApiRequest } from "next";
import type { User } from "../models/user";

declare module "next" {
	interface NextApiRequest {
		context?: {
			user?: User;
		};
	}
}
