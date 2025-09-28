import { getUser, clearAuth } from "../utils/storage.js";

const logoutBtn = document.getElementById("logout-btn");
const profileLink = document.querySelector('a[href="./profile.html"]');

if (!getUser()) {
	if (logoutBtn) logoutBtn.style.display = "none";
	if (profileLink) profileLink.style.display = "none";
}

logoutBtn?.addEventListener("click", () => {
	clearAuth();
	location.href = "./login.html";
});
