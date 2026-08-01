/**
 * backend/routes/deepseekRoutes.js
 * DeepSeek assistant proxy (mounted at /api/deepseek in server.js).
 *
 *   POST /api/deepseek/chat   -> answer a user message with page context
 *   GET  /api/deepseek/health -> readiness (is the API key configured?)
 *
 * Why a proxy: the DeepSeek API key must never reach the browser, so the SPA
 * talks to this endpoint and we call DeepSeek server-side with the secret key.
 *
 * Page "vision": forgeVidhya is a client-rendered SPA, so the meaningful page
 * content only exists in the browser's DOM after React renders. We therefore
 * take the *already-rendered* page context from the client (title, route,
 * headings, visible text, action labels) instead of re-fetching the URL on the
 * server (which would only yield an empty HTML shell and be an SSRF risk).
 *
 * Env:
 *   DEEPSEEK_API_KEY   - required; the secret API key (server-side only)
 *   DEEPSEEK_API_URL   - optional; defaults to the public chat completions URL
 *   DEEPSEEK_MODEL     - optional; defaults to 'deepseek-chat'
 */

const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// Optional logger — fall back to console if the project logger isn't present.
let logger;
try {
  logger = require('../utils/logger');
} catch {
  logger = { info: console.log, error: console.error, security: console.warn };
}

// ---------------------------------------------------------------------------
// Dedicated rate limit: this endpoint spends real money on every call, so it is
// throttled tighter than the global /api limiter (30 requests / 10 min / IP).
// ---------------------------------------------------------------------------
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many AI requests. Please wait a minute and try again.',
  },
  handler: (req, res, _next, options) => {
    logger.security?.('DEEPSEEK_RATE_LIMITED', { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  },
});

// ---------------------------------------------------------------------------
// Static site map so the assistant can give navigation instructions even for
// parts of the site the user isn't currently looking at.
// ---------------------------------------------------------------------------
const SITE_OVERVIEW = `forgeVidhya is an EdTech platform for tier-3 Indian engineering students (AI + engineering skills, built around shipping real projects).
Navigation (floating bubbles at the top of every page):
- Home (/), About (/about), Program (opens a category chooser), Blogs (/blog), Contact (/contact).
- A small drone beside the Contact bubble reveals a "sustainable city" easter egg.
- Top-right controls: sound mute toggle, and a light/dark theme toggle.
Programs are grouped into three categories: "AI & Tech", "Core Engineering", and "Non-Tech". Picking a category shows its programs; opening a program shows its knowledge base (chapters -> tappable topics). A few courses ship a hands-on tool behind a black button on the course page — currently: AI Automation Fundamentals (Flow Studio), Renewable Energy & Electric Mobility (EnergyGrid simulator), CAD Design & Digital Manufacturing (BlenderCAD 3D studio), and the Non-Tech "How not to play the pick me" course (AdmitEdge).`;

// Guardrails on payload sizes (defense-in-depth; the client also trims).
const MAX_MESSAGE_CHARS = 4000;
const MAX_PAGE_TEXT_CHARS = 6000;
const MAX_HISTORY = 12;
const MAX_HISTORY_CHARS = 1500;

/** Coerce to a trimmed string capped at `max` chars. */
function clip(value, max) {
  if (typeof value !== 'string') return '';
  const s = value.trim();
  return s.length > max ? s.slice(0, max) : s;
}

/** Build the system prompt from the client-supplied page context. */
function buildSystemPrompt(page) {
  const p = page && typeof page === 'object' ? page : {};
  const headings = Array.isArray(p.headings)
    ? p.headings.map((h) => clip(h, 160)).filter(Boolean).slice(0, 15)
    : [];
  const actions = Array.isArray(p.actions)
    ? p.actions.map((a) => clip(a, 80)).filter(Boolean).slice(0, 25)
    : [];

  return `You are the forgeVidhya AI assistant, embedded in the website and able to see the page the user is currently viewing.

${SITE_OVERVIEW}

CURRENT PAGE THE USER IS VIEWING:
- Title: ${clip(p.title, 200) || 'Unknown'}
- Route: ${clip(p.path, 200) || '/'}
- Description: ${clip(p.description, 300) || '(none)'}
- Headings on this page: ${headings.length ? headings.join(' | ') : '(none captured)'}
- Buttons/links available here: ${actions.length ? actions.join(', ') : '(none captured)'}
- Visible text on this page:
"""
${clip(p.text, MAX_PAGE_TEXT_CHARS) || '(no page text captured)'}
"""

How to help:
1. Answer using the current page's content first. If the user asks about something not on this page, use the site map to guide them there with concrete steps (e.g. "Open the Program bubble → Core Engineering → CAD Design & Digital Manufacturing").
2. If the information genuinely isn't available, say so plainly rather than inventing it.
3. Give clear, actionable instructions and short explanations. Use Markdown (headings, bold, lists, code) when it improves readability.
4. Be concise and friendly. You are a helpful product guide, not a salesperson.`;
}

// ---------------------------------------------------------------------------
// POST /api/deepseek/chat
// ---------------------------------------------------------------------------
router.post('/chat', chatLimiter, async (req, res) => {
  if (!DEEPSEEK_API_KEY) {
    logger.error('DeepSeek key missing: set DEEPSEEK_API_KEY in the backend env.');
    return res.status(503).json({
      success: false,
      error: 'The AI assistant is not configured yet (missing API key).',
    });
  }

  const message = clip(req.body?.message, MAX_MESSAGE_CHARS);
  if (!message) {
    return res.status(400).json({ success: false, error: 'A message is required.' });
  }

  // Normalize prior turns into DeepSeek's role/content shape.
  const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
  const history = rawHistory
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: clip(m.content, MAX_HISTORY_CHARS) }))
    .filter((m) => m.content);

  const messages = [
    { role: 'system', content: buildSystemPrompt(req.body?.page) },
    ...history,
    { role: 'user', content: message },
  ];

  // Abort if DeepSeek is slow, so we never hang the client.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const upstream = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: 1500,
        stream: false,
      }),
      signal: controller.signal,
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      const detail = data?.error?.message || `Upstream error ${upstream.status}`;
      logger.error('DeepSeek upstream error', { status: upstream.status, detail });
      // Don't leak upstream internals/keys to the client.
      return res.status(502).json({
        success: false,
        error: 'The AI service returned an error. Please try again shortly.',
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({
        success: false,
        error: 'The AI service returned an empty response. Please try again.',
      });
    }

    return res.json({ success: true, message: reply });
  } catch (err) {
    const aborted = err?.name === 'AbortError';
    logger.error('DeepSeek request failed', { message: err?.message, aborted });
    return res.status(aborted ? 504 : 500).json({
      success: false,
      error: aborted
        ? 'The AI took too long to respond. Please try again.'
        : 'Could not reach the AI service. Please try again.',
    });
  } finally {
    clearTimeout(timeout);
  }
});

// ---------------------------------------------------------------------------
// GET /api/deepseek/health — quick readiness probe for the SPA.
// ---------------------------------------------------------------------------
router.get('/health', (_req, res) => {
  res.json({ success: true, configured: Boolean(DEEPSEEK_API_KEY), model: DEEPSEEK_MODEL });
});

module.exports = router;
