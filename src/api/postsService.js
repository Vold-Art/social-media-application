import { requestJson } from "./apiClient";
import { getToken } from "../utils/storage.js";

const AUTH_HEADER = () => ({
	Authorization: `Bearer ${getToken()}`,
});

/* Fetch all posts */

export async function fetchAllPosts() {
	return requestJson("/social/posts");
}

/* Create a new post */

export async function createPost(postData) {
	return requestJson("/social/posts", {
		method: "POST",
		headers: AUTH_HEADER(),
		body: JSON.stringify(postData),
	});
}

/* Update an existing post */

export async function updatePost(id, postData) {
	return requestJson(`/social/posts/${id}`, {
		method: "PUT",
		headers: AUTH_HEADER(),
		body: JSON.stringify(postData),
	});
}

/* Delete a post */

export async function deletePost(id) {
	return requestJson(`/social/posts/${id}`, {
		method: "DELETE",
		headers: AUTH_HEADER(),
	});
}
