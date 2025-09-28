import { fetchAllPosts, createPost } from "../api/postsService.js";
import { isLoggedIn, getApiKey, saveApiKey } from "../utils/storage.js";
import { createApiKey } from "../api/authService.js";

const list = document.getElementById("post-list");
const errorBox = document.getElementById("feed-error");
const newPostForm = document.getElementById("new-post-form");
const newPostTitle = document.getElementById("post-title");
const newPostBody = document.getElementById("post-body");
const searchInput = document.getElementById("post-search");
let allPosts = [];
const newPostMediaUrl = document.getElementById("post-media-url");
const newPostMediaAlt = document.getElementById("post-media-alt");

/* Redirect to index if not logged in */

if (!isLoggedIn()) {
	location.href = "./index.html";
}

function escapeHtml(str) {
	return String(str)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

/* Search filter */

if (searchInput) {
	searchInput.addEventListener("input", () => {
		const q = searchInput.value.trim().toLowerCase();
		const filtered = allPosts.filter(
			(p) =>
				(p.title && p.title.toLowerCase().includes(q)) ||
				(p.body && p.body.toLowerCase().includes(q))
		);
		renderPosts(filtered);
	});
}

function renderPosts(posts) {
	if (!list) return;
	if (!Array.isArray(posts) || posts.length === 0) {
		list.innerHTML = `<p>No posts yet.</p>`;
		return;
	}

	list.innerHTML = posts
		.map((p) => {
			const title = p.title || "(untitled)";
			const body = p.body ? `<p>${escapeHtml(p.body)}</p>` : "";
			const author = p.author?.name || "Unknown";
			const created = p.created ? new Date(p.created).toLocaleString() : "";
			const media = p.media?.url
				? `<img src="${p.media.url}" alt="${escapeHtml(p.media.alt || "")}">`
				: "";
			const link = `./post.html?id=${encodeURIComponent(p.id)}`;

			return `
        <article>
          <h2><a href="${link}">${escapeHtml(title)}</a></h2>
          <small>by ${escapeHtml(author)} ${
				created ? "• " + created : ""
			}</small>
          ${media}
          ${body}
        </article>
      `;
		})
		.join("");
}

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

async function loadFeed() {
	if (!list || !errorBox) return;
	list.innerHTML = `<p>Loading posts...</p>`;
	errorBox.textContent = "";

	try {
		await ensureApiKey();
		const posts = await fetchAllPosts();
		allPosts = posts?.data || posts;
		renderPosts(allPosts);
	} catch (err) {
		errorBox.textContent =
			err instanceof Error ? err.message : "Failed to load posts";
		list.innerHTML = "";
	}
}

/* Create post */

newPostForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const title = newPostTitle.value.trim();
	const body = newPostBody.value.trim();
	const mediaUrl = newPostMediaUrl?.value.trim();
	const mediaAlt = newPostMediaAlt?.value.trim();

	if (!title) {
		alert("Title is required.");
		return;
	}

	const payload = mediaUrl
		? { title, body, media: { url: mediaUrl, alt: mediaAlt || "" } }
		: { title, body };

	const submitBtn = newPostForm.querySelector("button[type=submit]");
	if (submitBtn) submitBtn.disabled = true;

	try {
		await createPost(payload);
		newPostForm.reset();
		await loadFeed();
		newPostTitle.focus();
	} catch (err) {
		alert(err instanceof Error ? err.message : "Failed to create post");
	} finally {
		if (submitBtn) submitBtn.disabled = false;
	}
});

/* initial load */

loadFeed();
