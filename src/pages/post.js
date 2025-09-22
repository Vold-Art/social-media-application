import { fetchPost } from "../api/postsService.js";

const postBox = document.getElementById("post");
const errorBox = document.getElementById("post-error");

/* Safe guard against malicious code */

function escapeHtml(str) {
	return String(str)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

/* Get post ID from URL */

function getPostIdFromQuery() {
	const params = new URLSearchParams(location.search);
	return params.get("id");
}

/* Render a single post */

function renderPost(p) {
	if (!postBox) return;

	const title = p.title || "(untitled)";
	const author = p.author?.name || "Unknown";
	const created = p.created ? new Date(p.created).toLocaleDateString() : "";
	const body = p.body ? `<p>${escapeHtml(p.body)}</p>` : "";
	const media = p.media?.url
		? `<img src="${p.media.url}" alt="${p.media.alt || ""}">`
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

/* Load post on page start and loading message */

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
		const p = await fetchPost(id);
		renderPost(p?.data || p);
	} catch (err) {
		errorBox.textContent =
			err instanceof Error ? err.message : "Failed to load post";
		postBox.innerHTML = "";
	}
})();
