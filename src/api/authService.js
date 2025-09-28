import { requestJson } from "./apiClient.js";

export async function loginUser(credentials) {
	return requestJson("/auth/login", {
		method: "POST",
		body: JSON.stringify(credentials),
	});
}

export async function registerUser(userData) {
	return requestJson("/auth/register", {
		method: "POST",
		body: JSON.stringify(userData),
	});
}

export async function createApiKey() {
	const body = { name: `social-app-${Date.now()}` };
	return requestJson("/auth/create-api-key", {
		method: "POST",
		body: JSON.stringify(body),
	});
}
