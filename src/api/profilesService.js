import { requestJson } from "./apiClient.js";
import { getToken } from "../utils/storage.js";

function authHeaders() {
	const t = getToken();
	return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function fetchProfile(name) {
	return requestJson(
		`/social/profiles/${encodeURIComponent(
			name
		)}?_posts=true&_followers=true&_following=true`,
		{ headers: authHeaders() }
	);
}

export async function followUser(name) {
	return requestJson(`/social/profiles/${encodeURIComponent(name)}/follow`, {
		method: "POST",
		headers: authHeaders(),
	});
}

export async function unfollowUser(name) {
	return requestJson(`/social/profiles/${encodeURIComponent(name)}/unfollow`, {
		method: "POST",
		headers: authHeaders(),
	});
}
