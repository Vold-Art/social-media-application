import { getToken, getApiKey } from "../utils/storage.js";

const BASE_URL = "https://v2.api.noroff.dev";

export async function requestJson(path, options = {}) {
	if (!path.startsWith("/")) {
		throw new Error(`Path must start with "/": ${path}`);
	}

	const headers = new Headers(options.headers || {});

	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const token = getToken();
	if (token && !headers.has("Authorization")) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const apiKey = getApiKey();
	if (apiKey && !headers.has("X-Noroff-API-Key")) {
		headers.set("X-Noroff-API-Key", apiKey);
	}

	const res = await fetch(BASE_URL + path, { ...options, headers });

	let data = null;
	try {
		data = await res.json();
	} catch {}

	if (!res.ok) {
		const msg =
			(data && (data.message || data.errors)) ||
			res.statusText ||
			"Request failed";
		throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
	}

	return data;
}
