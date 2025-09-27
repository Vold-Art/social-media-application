import { fetchAllPosts, createPost } from "../api/postsService.js";
import { isLoggedIn } from "../utils/storage.js";

const list = document.getElementById("post-list");
const errorBox = document.getElementById("feed-error");
const newPostForm = document.getElementById("new-post-form");
const newPostTitle = document.getElementById("post-title");
const newPostBody = document.getElementById("post-body");
const searchInput = document.getElementById("post-search");
let allPosts = [];

/* Check if logged in */

if (!isLoggedIn()) {
	location.href = "./login.html";
}

/* Safe guard against malicious code */

function escapeHtml(str) {
	return String(str)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

/* Input filter search */

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

/* Render posts */

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

/* Load posts */

async function loadFeed() {
	if (!list || !errorBox) return;
	list.innerHTML = `<p>Loading posts...</p>`;
	errorBox.textContent = "";
	try {
		const posts = await fetchAllPosts();
		allPosts = posts?.data || posts;
		renderPosts(allPosts);
	} catch (err) {
		errorBox.textContent =
			err instanceof Error ? err.message : "Failed to load posts";
		list.innerHTML = "";
	}
}

/* Create post form */

if (newPostForm) {
	newPostForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const title = newPostTitle.value.trim();
		const body = newPostBody.value.trim();

		if (!title) {
			alert("Title is required.");
			return;
		}

		const submitBtn = newPostForm.querySelector("button[type=submit]");
		if (submitBtn) submitBtn.disabled = true;

		try {
			await createPost({ title, body });
			newPostForm.reset();
			await loadFeed(); // now works because loadFeed is in scope
			newPostTitle.focus();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to create post");
		} finally {
			if (submitBtn) submitBtn.disabled = false;
		}
	});
}

/* Initial load */

loadFeed();
