import { fetchAllPosts } from "../api/postsService.js";
import { isLoggedIn, getUser } from "../utils/storage.js";

const list = document.getElementById("post-list");
const errorBox = document.getElementById("feed-error");

/* Check if logged in */

if (!isLoggedIn()) {
	location.href = "./login.html";
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
				? `<img src="${p.media.url}" alt="${p.media.alt || ""}">`
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

/* Safe guard against malicious code */

function escapeHtml(str) {
	return String(str)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

/* Load posts on page start and loading message */

(async function loadFeed() {
	if (!list || !errorBox) return;
	list.innerHTML = `<p>Loading posts...</p>`;
	errorBox.textContent = "";

	try {
		const posts = await fetchAllPosts();
		renderPosts(posts?.data || posts);
	} catch (err) {
		errorBox.textContent =
			err instanceof Error ? err.message : "Failed to load posts";
		list.innerHTML = "";
	}
})();
