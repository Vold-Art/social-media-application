import { fetchPost, deletePost, updatePost } from "../api/postsService.js";
import { getUser, getApiKey, saveApiKey } from "../utils/storage.js";
import { createApiKey } from "../api/authService.js";

const postBox = document.getElementById("post");
const errorBox = document.getElementById("post-error");
const actionsBox = document.getElementById("post-actions");
const editForm = document.getElementById("edit-form");
const editTitle = document.getElementById("edit-title");
const editBody = document.getElementById("edit-body");
const editError = document.getElementById("edit-error");
const editCancelBtn = document.getElementById("edit-cancel-btn");

function escapeHtml(str) {
	return String(str)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function getPostIdFromQuery() {
	const params = new URLSearchParams(location.search);
	return params.get("id");
}

function renderPost(p) {
	if (!postBox) return;

	const title = p.title || "(untitled)";
	const author = p.author?.name || "Unknown";
	const created = p.created ? new Date(p.created).toLocaleDateString() : "";
	const body = p.body ? `<p>${escapeHtml(p.body)}</p>` : "";
	const media = p.media?.url
		? `<img src="${p.media.url}" alt="${escapeHtml(p.media.alt || "")}">`
		: "";

	postBox.innerHTML = `
    <article>
      <h2>${escapeHtml(title)}</h2>
      <small>by ${escapeHtml(author)} ${created ? "• " + created : ""}</small>
      ${media}
      ${body}
    </article>
  `;
}

function renderActions(post) {
	if (!actionsBox) return;
	actionsBox.innerHTML = "";

	const current = getUser();
	const isOwner =
		current?.name &&
		post?.author?.name &&
		current.name.toLowerCase() === post.author.name.toLowerCase();

	if (!isOwner) return;

	actionsBox.innerHTML = `
    <div>
      <button id="post-edit-btn" type="button">Edit</button>
      <button id="post-delete-btn" type="button">Delete</button>
    </div>
  `;
}

function wireActions(post) {
	const delBtn = document.getElementById("post-delete-btn");
	const editBtn = document.getElementById("post-edit-btn");

	if (delBtn) {
		delBtn.addEventListener("click", async () => {
			const ok = confirm("Delete this post?");
			if (!ok) return;

			delBtn.disabled = true;
			errorBox.textContent = "";

			try {
				await deletePost(post.id);
				location.href = "./feed.html";
			} catch (err) {
				delBtn.disabled = false;
				errorBox.textContent =
					err instanceof Error ? err.message : "Failed to delete post";
			}
		});
	}

	if (editBtn) {
		editBtn.addEventListener("click", () => {
			showEditForm(post);
		});
	}
}

function showEditForm(post) {
	if (!editForm || !editTitle || !editBody) return;

	editError.textContent = "";
	editTitle.value = post.title || "";
	editBody.value = post.body || "";

	editForm.style.display = "block";
}

function wireEditForm(post) {
	if (!editForm) return;

	editForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		editError.textContent = "";

		const payload = {
			title: editTitle.value.trim(),
			body: editBody.value.trim(),
		};

		if (!payload.title) {
			editError.textContent = "Title is required.";
			return;
		}

		const submitBtn = document.getElementById("edit-save-btn");
		if (submitBtn) submitBtn.disabled = true;

		try {
			const updated = await updatePost(post.id, payload);
			const fresh = updated?.data || updated || post;

			renderPost(fresh);
			renderActions(fresh);
			wireActions(fresh);

			editForm.style.display = "none";
		} catch (err) {
			editError.textContent =
				err instanceof Error ? err.message : "Failed to update post";
		} finally {
			if (submitBtn) submitBtn.disabled = false;
		}
	});

	if (editCancelBtn) {
		editCancelBtn.addEventListener("click", () => {
			editError.textContent = "";
			editForm.style.display = "none";
		});
	}
}

// Ensure an API key exists on this page too (some endpoints require it)
async function ensureApiKey() {
	let key = getApiKey();
	if (key) return key;

	try {
		const res = await createApiKey();
		key = res?.data?.key ?? res?.key ?? null;
		if (key) {
			saveApiKey(key);
			return key;
		}
		throw new Error("API key not returned from server");
	} catch (e) {
		throw new Error(
			e instanceof Error ? e.message : "Failed to create API key"
		);
	}
}

(async function loadPost() {
	if (!postBox || !errorBox) return;

	const id = getPostIdFromQuery();
	if (!id) {
		errorBox.textContent = "No post id provided.";
		return;
	}

	postBox.innerHTML = "<p>Loading post...</p>";
	errorBox.textContent = "";

	try {
		await ensureApiKey();
		const p = await fetchPost(id);
		const post = p?.data || p;
		renderPost(post);
		renderActions(post);
		wireActions(post);
		wireEditForm(post);
	} catch (err) {
		errorBox.textContent =
			err instanceof Error ? err.message : "Failed to load post";
		postBox.innerHTML = "";
	}
})();
