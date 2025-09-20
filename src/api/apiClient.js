/* Base API URL */

const BASE_URL = "https://v2.api.noroff.dev";

/* Path Check for URLs */

export async function requestJson(path, options = {}) {
	if (!path.startsWith("/")) {
		throw new Error(`Path must start with "/": ${path}`);
	}

	/* Header setup */

	const headers = new Headers(options.headers || {});
	if (!headers.has("Content-Type"))
		headers.set("Content-Type", "application/json");

	/* Fetch call */

	const res = await fetch(BASE_URL + path, { ...options, headers });

	/* Response call */

	let data;
	try {
		data = await res.json();
	} catch {
		data = null;
	}

	/* Error handling */

	if (!res.ok) {
		const msg =
			(data && (data.message || data.errors)) ||
			res.statusText ||
			"Request failed";
		throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
	}

	return data;
}
