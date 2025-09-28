const TOKEN_KEY = "social_token";
const USER_KEY = "social_user";
const API_KEY = "social_api_key";

/* Save token + minimal user info */

export function saveAuth(resp) {
	const data = resp?.data ?? resp ?? {};
	const token = data.accessToken ?? null;
	const name = data.name ?? null;
	const email = data.email ?? null;

	if (!token) {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		console.warn("[saveAuth] No accessToken in response, not saving.");
		return;
	}

	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify({ name, email }));
}

/* Read saved JWT (or null) */

export function getToken() {
	const t = localStorage.getItem(TOKEN_KEY);
	return t && t !== "undefined" ? t : null;
}

/* Read saved user object (or null) */

export function getUser() {
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		localStorage.removeItem(USER_KEY);
		return null;
	}
}

/* Save / read Noroff API key */

export function saveApiKey(key) {
	if (key) localStorage.setItem(API_KEY, key);
}
export function getApiKey() {
	const k = localStorage.getItem(API_KEY);
	return k && k !== "undefined" ? k : null;
}

/* Clear all auth-related storage */

export function clearAuth() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
	localStorage.removeItem(API_KEY);
}

/* Quick boolean check */

export function isLoggedIn() {
	return !!getToken();
}
