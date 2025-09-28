import { loginUser, createApiKey } from "../api/authService.js";
import { saveAuth, saveApiKey, isLoggedIn } from "../utils/storage.js";

console.log("[login.js] loaded");

const form = document.getElementById("login-form");
const emailEl = document.getElementById("login-email");
const passwordEl = document.getElementById("login-password");
const errorBox = document.getElementById("login-error");

form?.setAttribute("novalidate", "");

console.log(
	"[login] exist? form:",
	!!form,
	"email:",
	!!emailEl,
	"password:",
	!!passwordEl,
	"error:",
	!!errorBox
);

if (isLoggedIn()) {
	console.log("[login] already logged in → redirecting to feed");
	location.href = "./feed.html";
}

if (!form || !emailEl || !passwordEl) {
	console.error("[login] missing element(s)", { form, emailEl, passwordEl });
}

form?.addEventListener("submit", async (e) => {
	e.preventDefault();
	console.log("[login] submit fired");
	if (errorBox) errorBox.textContent = "";

	const payload = {
		email: emailEl.value.trim(),
		password: passwordEl.value,
	};

	if (!payload.email || !payload.password) {
		if (errorBox) errorBox.textContent = "Email and password are required.";
		return;
	}

	console.log("[login] attempting login for", payload.email);

	try {
		const data = await loginUser(payload);

		console.log("[login] full response:", JSON.stringify(data, null, 2));

		const token =
			data?.accessToken ??
			data?.data?.accessToken ??
			data?.meta?.accessToken ??
			data?.token ??
			null;

		const name = data?.name ?? data?.data?.name ?? null;
		const email = data?.email ?? data?.data?.email ?? payload.email;

		console.log("[login] extracted token:", token);

		if (!token) {
			const msg = "Login succeeded but no access token was returned.";
			console.warn("[login]", msg);
			if (errorBox) errorBox.textContent = msg;
			return;
		}

		saveAuth({ name, email, accessToken: token });

		try {
			const keyRes = await createApiKey();
			const apiKey = keyRes?.data?.key ?? keyRes?.key ?? null;
			console.log("[login] created api key:", apiKey);
			if (apiKey) saveApiKey(apiKey);
		} catch (e2) {
			console.warn("[login] createApiKey failed (continuing):", e2);
		}

		console.log("[login] token now:", localStorage.getItem("social_token"));
		console.log("[login] user now:", localStorage.getItem("social_user"));

		location.href = "./feed.html";
	} catch (err) {
		const msg = err instanceof Error ? err.message : "Login failed";
		console.error("[login] error:", msg);
		if (errorBox) errorBox.textContent = msg;
	}
});
