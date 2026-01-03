import {
	InternalServerError,
	MethodNotAllowedError,
	ValidationError,
} from "infra/errors";

function onNoMatchHandler(request: any, response: any) {
	const publicErrorObject = new MethodNotAllowedError();
	response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error: any, request, response: any) {
	if (error instanceof ValidationError) {
		return response.status(error.statusCode).json(error);
	}
	const publicErrorObject = new InternalServerError({
		cause: error,
		statusCode: error.statusCode,
	});
	console.error(publicErrorObject);

	response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
	errorHandlers: {
		onNoMatch: onNoMatchHandler,
		onError: onErrorHandler,
	},
};

export default controller;
