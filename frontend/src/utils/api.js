/**
 * frontend/src/utils/api.js
 * Central axios instance: sends httpOnly cookies, attaches CSRF tokens,
 * sanitizes responses, and transparently refreshes expired access tokens.
 *
 * Security note: Keeps auth tokens out of JS/localStorage (cookies are httpOnly),
 * adds CSRF protection to mutations, and scrubs API HTML before it can render.
 *
 * Env variables (Vite):
 *   VITE_API_URL - API base, e.g. 'https://forgevidhya.in/api'
 */

import axios from 'axios';
import DOMPurify from 'dompurify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send/receive httpOnly auth cookies
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// --- CSRF token handling ---------------------------------------------------
let csrfToken = null;

export const fetchCsrfToken = async () => {
  const { data } = await api.get('/csrf-token');
  csrfToken = data.csrfToken;
  return csrfToken;
};

// Attach the CSRF token to every state-changing request.
api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    if (!csrfToken) await fetchCsrfToken();
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// --- Response sanitization + token refresh ---------------------------------

// Recursively DOMPurify any string in the payload so stored-XSS can't render.
const sanitizeDeep = (value) => {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  if (Array.isArray(value)) return value.map(sanitizeDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeDeep(v)]));
  }
  return value;
};

let isRefreshing = false;
let queue = [];
const flushQueue = (err) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve()));
  queue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = sanitizeDeep(response.data);
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // On expired access token, try a single silent refresh, then replay.
    if (status === 401 && code === 'TOKEN_EXPIRED' && !original._retry) {
      if (isRefreshing) {
        // Wait for the in-flight refresh to complete, then retry.
        return new Promise((resolve, reject) => {
          queue.push({ resolve: () => resolve(api(original)), reject });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await api.post('/auth/refresh'); // server rotates cookies
        flushQueue(null);
        return api(original);
      } catch (refreshErr) {
        flushQueue(refreshErr);
        // Refresh failed -> force re-login.
        if (typeof window !== 'undefined') window.location.assign('/login');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper for rendering server HTML safely if you ever must use it.
export const safeHtml = (dirty) =>
  DOMPurify.sanitize(dirty || '', { USE_PROFILES: { html: true } });

export default api;
