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

/* Fetch all posts */

export async function fetchAllPosts() {
	return requestJson("/social/posts", {
		method: "GET",
		headers: authPlusKeyHeaders(),
	});
}

/* Create a new post */

export async function createPost(payload) {
	return requestJson("/social/posts", {
		method: "POST",
		headers: authPlusKeyHeaders(),
		body: JSON.stringify(payload),
	});
}

/* Update an existing post */

export async function updatePost(id, payload) {
	return requestJson(`/social/posts/${id}`, {
		method: "PUT",
		headers: authPlusKeyHeaders(),
		body: JSON.stringify(payload),
	});
}

/* Delete a post */

export async function deletePost(id) {
	return requestJson(`/social/posts/${id}`, {
		method: "DELETE",
		headers: authPlusKeyHeaders(),
	});
}
