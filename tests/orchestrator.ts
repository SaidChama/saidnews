import retry from "async-retry";
import { error } from "node:console";

async function waitForAllServices() {
	await waitForWebServer();

	async function waitForWebServer() {
		return retry(fetchStatusPage, {
			retries: 100,
			maxTimeout: 1000,
		});

		async function fetchStatusPage() {
			const response = await fetch("http://localhost:3000/api/v1/status");
			if (response.status) {
				throw Error();
			}
		}
	}
}

export default {
	waitForAllServices,
};
