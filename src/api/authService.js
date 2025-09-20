import { requestJson } from "./apiClient.js";

/* Register User */

export async function registerUser(userData) {
	return requestJson("/auth/register", {
		method: "POST",
		body: JSON.stringify(userData),
	});
}

/* Log in User */

export async function loginUser(credentials) {
	return requestJson("/auth/login", {
		method: "POST",
		body: JSON.stringify(credentials),
	});
}
