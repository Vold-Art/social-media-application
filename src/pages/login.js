import { registerUser, loginUser } from "../api/authService.js";
import { saveAuth } from "../utils/storage.js";

/* Grab input elements */

const form = document.getElementById("register-form");
const emailEl = document.getElementById("reg-email");
const passwordEl = document.getElementById("reg-password");
const errorBox = document.getElementById("register-error");

/* Event listener for form data */

form?.addEventListener("submit", async (e) => {
	e.preventDefault();
	errorBox.textContent = "";

	/* Prepare user data for the API */

	const payload = {
		email: emailEl.value.trim(),
		password: passwordEl.value,
	};

	/* Log in registered user */

	try {
		const data = await loginUser(payload);

		/* Save token and user in localStorage */

		saveAuth({
			name: data.name,
			email: data.email,
			accessToken: data.accessToken,
		});

		/* Redirect to feed page */

		location.href = "./feed.html";
	} catch (err) {
		errorBox.textContent = err instanceof Error ? err.message : "Login failed";
	}
});
