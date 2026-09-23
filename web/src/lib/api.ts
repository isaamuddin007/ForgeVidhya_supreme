/**
 * Where the backend lives.
 *
 * Each caller used to fall back to "http://localhost:5000" when VITE_API_URL
 * was unset. That is right in development and wrong everywhere else: the value
 * is baked into the bundle at build time, so a production build made without
 * the variable sends every visitor's browser to port 5000 *on their own
 * machine*. The requests can only fail, and they fail on first paint.
 *
 * So the localhost default now applies only when the page is itself being
 * served from localhost. Anywhere else, an unset VITE_API_URL means there is
 * no backend to call, and callers skip the request instead of guessing.
 */

const configured = (import.meta.env.VITE_API_URL as string | undefined)
  ?.trim()
  .replace(/\/$/, "");

const onLocalhost =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

/** The backend origin, or "" when none is configured for this deployment. */
export const API_URL = configured || (onLocalhost ? "http://localhost:5000" : "");

/** False when there is no backend to talk to — check before fetching. */
export const apiEnabled = API_URL !== "";
