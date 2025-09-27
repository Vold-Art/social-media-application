import {
	fetchProfile,
	followUser,
	unfollowUser,
} from "../api/profilesService.js";
import { isLoggedIn, getUser } from "../utils/storage.js";

const profileBox = document.getElementById("profile");
const postsBox = document.getElementById("profile-posts");
const errorBox = document.getElementById("profile-error");
const actionsBox = document.getElementById("profile-actions");

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

/* Decide which profile to load */

function getTargetProfileName() {
	const q = new URLSearchParams(location.search);
	return q.get("name");
}

/* Render profile */

function renderProfile(p) {
	if (!profileBox) return;
	const name = p.name || "";
	const email = p.email || "";
	const avatarUrl = p.avatar?.url || "";
	const avatarAlt = p.avatar?.alt || "";

	profileBox.innerHTML = `
    <article>
      <h2>${escapeHtml(name)}</h2>
      <p>${escapeHtml(email)}</p>
      ${
				avatarUrl
					? `<img src="${avatarUrl}" alt="${escapeHtml(avatarAlt)}">`
					: ""
			}
    </article>
  `;
}

/* Render posts */

function renderPosts(posts) {
	if (!postsBox) return;
	if (!Array.isArray(posts) || posts.length === 0) {
		postsBox.innerHTML = `<p>No posts yet.</p>`;
		return;
	}
	postsBox.innerHTML = posts
		.map((p) => {
			const title = p.title || "(untitled)";
			const body = p.body ? `<p>${escapeHtml(p.body)}</p>` : "";
			const media = p.media?.url
				? `<img src="${p.media.url}" alt="${escapeHtml(p.media.alt || "")}">`
				: "";
			const link = `./post.html?id=${encodeURIComponent(p.id)}`;
			return `
        <article>
          <h3><a href="${link}">${escapeHtml(title)}</a></h3>
          ${media}
          ${body}
        </article>
      `;
		})
		.join("");
}

/* Check if current user is following the target */

function isCurrentUserFollowing(targetProfile, currentName) {
	const followers =
		targetProfile?.followers ?? targetProfile?.followers?.data ?? [];
	if (!Array.isArray(followers)) return false;
	return followers.some((f) => f?.name === currentName);
}

/* Render Follow/Unfollow button when viewing someone else's profile */

function renderFollowActions(targetProfile, me) {
	if (!actionsBox) return;
	actionsBox.innerHTML = "";

	const isSelf =
		me?.name && targetProfile?.name && me.name === targetProfile.name;
	if (isSelf) return;

	const following = isCurrentUserFollowing(targetProfile, me?.name);
	const label = following ? "Unfollow" : "Follow";

	actionsBox.innerHTML = `
    <button id="follow-toggle-btn" type="button">${label}</button>
  `;
}

/* Wire Follow/Unfollow click handler */

function wireFollowActions(targetName) {
	const btn = document.getElementById("follow-toggle-btn");
	if (!btn) return;

	btn.addEventListener("click", async () => {
		btn.disabled = true;
		errorBox.textContent = "";
		try {
			if (btn.textContent === "Follow") {
				await followUser(targetName);
			} else {
				await unfollowUser(targetName);
			}
			await loadProfile();
		} catch (err) {
			errorBox.textContent =
				err instanceof Error ? err.message : "Failed to update follow state";
		} finally {
			btn.disabled = false;
		}
	});
}

/* Load profile (self or other) and render profile, posts and follow UI */

async function loadProfile() {
	if (!profileBox || !postsBox || !errorBox) return;

	const me = getUser();
	if (!me?.name) {
		errorBox.textContent = "No logged-in user.";
		return;
	}

	/* choose target or fallback to myself */

	const targetName = getTargetProfileName() || me.name;

	profileBox.innerHTML = `<p>Loading profile…</p>`;
	postsBox.innerHTML = `<p>Loading posts…</p>`;
	if (actionsBox) actionsBox.innerHTML = "";
	errorBox.textContent = "";

	try {
		const res = await fetchProfile(targetName);
		const data = res?.data || res;

		renderProfile(data);

		const posts = Array.isArray(data.posts)
			? data.posts
			: data?.posts?.data || [];
		renderPosts(posts);

		renderFollowActions(data, me);
		wireFollowActions(targetName);
	} catch (err) {
		errorBox.textContent =
			err instanceof Error ? err.message : "Failed to load profile";
		profileBox.innerHTML = "";
		postsBox.innerHTML = "";
		if (actionsBox) actionsBox.innerHTML = "";
	}
}

/* Initial load */

loadProfile();
