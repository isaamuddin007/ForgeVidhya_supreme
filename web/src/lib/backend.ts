/**
 * Typed client for the forgeVidhya backend (Cloudflare Worker).
 * All endpoints return `{ ok: boolean, ... }`; failures throw with a
 * human-readable message so callers can show a toast.
 */

const BACKEND_URL: string =
  (import.meta.env.EXPO_PUBLIC_RORK_FUNCTIONS_URL as string | undefined) ?? "";

type ApiResult = { ok: boolean; error?: string };

async function post<T extends ApiResult>(path: string, body: unknown): Promise<T> {
  if (!BACKEND_URL) {
    throw new Error("Backend is not configured");
  }
  const token = localStorage.getItem("rork:access_token");
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({ ok: false }))) as T;
  if (!res.ok || !data.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export type ContactPayload = {
  name: string;
  email: string;
  college?: string;
  branch?: string;
  message: string;
};

/** Submits the contact form. Throws on failure. */
export function submitContact(payload: ContactPayload): Promise<ApiResult> {
  return post("/api/contact", payload);
}

/** Subscribes an email to the newsletter. Resolves with dedupe info. */
export function subscribeNewsletter(
  email: string,
): Promise<ApiResult & { alreadySubscribed?: boolean }> {
  return post("/api/newsletter", { email });
}

/** Registers interest in a course/track. */
export function enrollInCourse(payload: {
  courseSlug: string;
  name: string;
  email: string;
}): Promise<ApiResult & { alreadyEnrolled?: boolean }> {
  return post("/api/enroll", payload);
}
