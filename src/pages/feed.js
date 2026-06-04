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
const pagination = document.getElementById("pagination");
const postsPerPage = 30;
let currentPage = 1;
let visiblePosts = [];
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

		visiblePosts = allPosts.filter(
			(p) =>
				(p.title && p.title.toLowerCase().includes(q)) ||
				(p.body && p.body.toLowerCase().includes(q)),
		);

		currentPage = 1;
		renderPosts(visiblePosts);
	});
}

function renderPagination(posts) {
	if (!pagination) return;

	const totalPages = Math.ceil(posts.length / postsPerPage);

	if (totalPages <= 1) {
		pagination.innerHTML = "";
		return;
	}

	pagination.innerHTML = `
		<button
			type="button"
			id="prev-page"
			class="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
			${currentPage === 1 ? "disabled" : ""}
		>
			Previous
		</button>

		<span class="text-sm text-gray-700" aria-live="polite">
			Page ${currentPage} of ${totalPages}
		</span>

		<button
			type="button"
			id="next-page"
			class="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
			${currentPage === totalPages ? "disabled" : ""}
		>
			Next
		</button>
	`;

	document.getElementById("prev-page")?.addEventListener("click", () => {
		currentPage -= 1;
		renderPosts(posts);
	});

	document.getElementById("next-page")?.addEventListener("click", () => {
		currentPage += 1;
		renderPosts(posts);
	});
}

function renderPosts(posts) {
	if (!list) return;

	if (!Array.isArray(posts) || posts.length === 0) {
		list.innerHTML = `<p class="text-gray-500 italic font-roboto">No posts found.</p>`;
		if (pagination) pagination.innerHTML = "";
		return;
	}

	const start = (currentPage - 1) * postsPerPage;
	const end = start + postsPerPage;
	const paginatedPosts = posts.slice(start, end);

	list.innerHTML = paginatedPosts
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

	renderPagination(posts);
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
			e instanceof Error ? e.message : "Failed to create API key",
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
		visiblePosts = allPosts;
		currentPage = 1;
		renderPosts(visiblePosts);
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
		errorBox.textContent = "Title is required.";
		newPostTitle.focus();
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
		errorBox.textContent =
			err instanceof Error ? err.message : "Failed to create post";
	} finally {
		if (submitBtn) submitBtn.disabled = false;
	}
});

loadFeed();
