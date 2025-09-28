import { requestJson } from "./apiClient.js";
import { getToken, getApiKey } from "../utils/storage.js";

function authPlusKeyHeaders() {
	const t = getToken();
	const k = getApiKey();
	const headers = {};
	if (t) headers.Authorization = `Bearer ${t}`;
	if (k) headers["X-Noroff-API-Key"] = k;
	return headers;
}

export async function fetchProfile(name) {
	return requestJson(
		`/social/profiles/${encodeURIComponent(name)}?_posts=true&_followers=true`,
		{
			method: "GET",
			headers: authPlusKeyHeaders(),
		}
	);
}

export async function followUser(name) {
	return requestJson(`/social/profiles/${encodeURIComponent(name)}/follow`, {
		method: "PUT",
		headers: authPlusKeyHeaders(),
	});
}

export async function unfollowUser(name) {
	return requestJson(`/social/profiles/${encodeURIComponent(name)}/unfollow`, {
		method: "PUT",
		headers: authPlusKeyHeaders(),
	});
}
