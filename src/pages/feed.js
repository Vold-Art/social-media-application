import { fetchAllPosts, createPost } from "../api/postsService.js";
import { isLoggedIn, getApiKey, saveApiKey } from "../utils/storage.js";
import { createApiKey } from "../api/authService.js";

const list = document.getElementById("post-list");
const errorBox = document.getElementById("feed-error");
const newPostForm = document.getElementById("new-post-form");
const newPostTitle = document.getElementById("post-title");
const newPostBody = document.getElementById("post-body");
const searchInput = document.getElementById("post-search");
const newPostMediaUrl = document.getElementById("post-media-url");
const newPostMediaAlt = document.getElementById("post-media-alt");
let allPosts = [];

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
		list.innerHTML = `<p class="text-gray-500 italic font-roboto">No posts yet.</p>`;
		return;
	}

	list.innerHTML = posts
		.map((p) => {
			const title = p.title || "(untitled)";
			const body = p.body ? escapeHtml(p.body) : "";
			const created = p.created ? new Date(p.created).toLocaleString() : "";
			const link = `./post.html?id=${encodeURIComponent(p.id)}`;

			const authorName = p.author?.name || "Unknown";
			const authorLink = p.author?.name
				? `<a 
              href="./profile.html?name=${encodeURIComponent(p.author.name)}" 
              class="font-roboto font-medium text-gray-600 hover:text-charcoal hover:underline"
            >
              ${escapeHtml(authorName)}
            </a>`
				: `<span class="font-roboto font-medium text-gray-600">
            ${escapeHtml(authorName)}
          </span>`;

			const media = p.media?.url
				? `<img 
            src="${p.media.url}" 
            alt="${escapeHtml(p.media.alt || "")}" 
            class="w-full h-56 object-cover rounded-md mb-3"
          />`
				: "";

			return `
        <article class="font-roboto bg-white rounded-lg shadow-md p-6 flex flex-col gap-2 max-w-4xl mx-auto">
          <h2 class="text-lg font-semibold text-gray-900">
            <a href="${link}" class="hover:underline">
              ${escapeHtml(title)}
            </a>
          </h2>
          <small class="text-sm text-gray-500">
            by ${authorLink} ${created ? "• " + created : ""}
          </small>
          ${media}
          ${body ? `<p class="text-gray-800 leading-relaxed">${body}</p>` : ""}
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

newPostForm?.addEventListener("submit", async (e) => {
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

loadFeed();
