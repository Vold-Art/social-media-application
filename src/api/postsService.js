import { requestJson } from "./apiClient.js";
import { getToken } from "../utils/storage.js";

function authHeaders() {
	const t = getToken();
	return t ? { Authorization: `Bearer ${t}` } : {};
}

/* Get all posts */
export async function fetchAllPosts() {
	return requestJson("/social/posts");
}

/* Get a single post by id */
export async function fetchPost(id) {
	return requestJson(`/social/posts/${encodeURIComponent(id)}`);
}

/* Create a new post */
export async function createPost(payload) {
	return requestJson("/social/posts", {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify(payload),
	});
}

/* Update an existing post */
export async function updatePost(id, payload) {
	return requestJson(`/social/posts/${encodeURIComponent(id)}`, {
		method: "PUT",
		headers: authHeaders(),
		body: JSON.stringify(payload),
	});
}

/* Delete a post */
export async function deletePost(id) {
	return requestJson(`/social/posts/${encodeURIComponent(id)}`, {
		method: "DELETE",
		headers: authHeaders(),
	});
}
