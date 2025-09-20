/* Label keys */

const TOKEN_KEY = "social_token";
const USER_KEY = "social_user";

/* Save token and user data after login/register */

export function saveAuth(data) {
	localStorage.setItem(TOKEN_KEY, data.accessToken);
	localStorage.setItem(USER_KEY, JSON.stringify(data));
}

/* Get saved token */

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

/* Get saved user object */

export function getUser() {
	const raw = localStorage.getItem(USER_KEY);
	return raw ? JSON.parse(raw) : null;
}

/* Remove token and user keys */

export function clearAuth() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
}
