import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X, Maximize2, Minimize2, Trash2, Copy, Eye } from "lucide-react";
import { useSound } from "@/components/sound-provider";
import { cn } from "@/lib/utils";

/**
 * DeepSeekAssistant — a page-aware AI helper that floats on every page.
 *
 * Clicking the launcher opens a large, drag-resizable, light frosted-glass chat
 * window that covers the website frame. On each question it captures the
 * *rendered* page (title, route, headings, visible text, action labels) and
 * sends it to the backend proxy (`/api/deepseek/chat`), which forwards it to
 * DeepSeek with the server-side key — so the assistant genuinely "sees" the
 * page. The API key never touches the browser.
 *
 * Vision = DOM text/structure (deepseek-chat is a text model), captured client
 * side because this is a client-rendered SPA (a server-side URL fetch would only
 * see an empty HTML shell).
 */

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000";
const CHAT_ENDPOINT = `${API_URL}/api/deepseek/chat`;

// Light frosted-glass palette.
const GLASS_BG = "rgba(255, 255, 255, 0.55)";
const GLASS_BG_STRONG = "rgba(255, 255, 255, 0.7)";
const ACCENT = "#2e6dff";
const GLASS_BORDER = "rgba(148, 163, 184, 0.32)";

type Role = "user" | "assistant" | "system";
interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  at: number;
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the forgeVidhya assistant 👋 I can **see the page you're on** — ask me anything about it, or how to find something on the site.",
  at: Date.now(),
};

type ResizeDir = "top" | "bottom" | "left" | "right" | "tl" | "tr" | "bl" | "br";

/** Snapshot of the live rendered page, sent to the backend as context. */
function extractPageContext() {
  const root = document.querySelector("main") ?? document.body;
  const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

  const headings = Array.from(root.querySelectorAll("h1, h2, h3"))
    .map((el) => (el.textContent || "").trim())
    .filter(Boolean)
    .slice(0, 15);

  const actions = Array.from(root.querySelectorAll("a, button"))
    .map((el) => (el.textContent || "").replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 0 && t.length < 60)
    .slice(0, 25);

  const text = (root as HTMLElement).innerText.replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim();

  return {
    url: window.location.href,
    path: window.location.pathname + window.location.search,
    title: document.title,
    description:
      document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
    headings,
    actions: Array.from(new Set(actions)),
    text: clip(text, 6000),
  };
}

export function DeepSeekAssistant() {
  const { playBlub } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [size, setSize] = useState({ w: 100, h: 100 }); // % of viewport — covers the frame; drag edges to shrink
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resizingRef = useRef<ResizeDir | null>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // Focus the input + read the current page title when the window opens.
  useEffect(() => {
    if (isOpen) {
      setPageTitle(document.title);
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Lock background scroll while open so the full-frame window has no stray
  // scrollbar (and 100vw doesn't overflow). Restored on close.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ---- Drag-to-resize (centered box; edges/corners follow the cursor) -------
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const dir = resizingRef.current;
      if (!dir) return;
      const horiz = dir === "left" || dir === "right" || dir.length === 2;
      const vert = dir === "top" || dir === "bottom" || dir.length === 2;
      setSize((prev) => {
        let { w, h } = prev;
        if (horiz) {
          w = Math.max(34, Math.min(100, (Math.abs(e.clientX - window.innerWidth / 2) / window.innerWidth) * 200));
        }
        if (vert) {
          h = Math.max(40, Math.min(100, (Math.abs(e.clientY - window.innerHeight / 2) / window.innerHeight) * 200));
        }
        return { w, h };
      });
    };
    const onUp = () => {
      resizingRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent, dir: ResizeDir, cursor: string) => {
    if (isFullScreen) return;
    e.preventDefault();
    resizingRef.current = dir;
    document.body.style.userSelect = "none";
    document.body.style.cursor = cursor;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text, at: Date.now() };
    const history = messages
      .filter((m) => m.id !== "welcome" && m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, page: extractPageContext(), history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.error || `Request failed (${res.status})`);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.message, at: Date.now() },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "assistant", content: `⚠️ ${msg}`, at: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const clearChat = () => setMessages([{ ...WELCOME, at: Date.now() }]);

  const copyMessage = useCallback((id: string, content: string) => {
    try {
      void navigator.clipboard?.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
    } catch {
      /* clipboard blocked — ignore */
    }
  }, []);

  const dims = isFullScreen
    ? { width: "100%", height: "100%", top: 0, left: 0, borderRadius: 0 }
    : {
        width: `${size.w}vw`,
        height: `${size.h}vh`,
        top: `${(100 - size.h) / 2}vh`,
        left: `${(100 - size.w) / 2}vw`,
        borderRadius: 24,
      };

  return (
    <>
      {/* Launcher — light glass */}
      <motion.button
        type="button"
        onClick={() => {
          playBlub();
          setIsOpen((o) => !o);
        }}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        className="fixed bottom-6 right-6 z-[70] grid h-16 w-16 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#2e6dff]/30"
        style={{
          background: GLASS_BG_STRONG,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${GLASS_BORDER}`,
          boxShadow: "0 10px 30px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.85)",
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${ACCENT}` }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {isOpen ? (
          <X className="h-7 w-7" style={{ color: ACCENT }} />
        ) : (
          <Bot className="h-8 w-8" style={{ color: ACCENT }} />
        )}
      </motion.button>

      {/* Full-frame chat window — light frosted glass, drag-resizable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-[80] flex flex-col overflow-hidden text-slate-800"
            style={{
              ...dims,
              background: GLASS_BG,
              backdropFilter: "blur(30px) saturate(140%)",
              WebkitBackdropFilter: "blur(30px) saturate(140%)",
              border: `1px solid ${GLASS_BORDER}`,
              boxShadow: "0 24px 70px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.75)",
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-label="forgeVidhya AI assistant"
          >
            {/* Resize handles (edges + corners) */}
            {!isFullScreen && (
              <>
                <div onMouseDown={(e) => startResize(e, "top", "ns-resize")} className="absolute inset-x-3 top-0 z-20 h-1.5 cursor-ns-resize" />
                <div onMouseDown={(e) => startResize(e, "bottom", "ns-resize")} className="absolute inset-x-3 bottom-0 z-20 h-1.5 cursor-ns-resize" />
                <div onMouseDown={(e) => startResize(e, "left", "ew-resize")} className="absolute inset-y-3 left-0 z-20 w-1.5 cursor-ew-resize" />
                <div onMouseDown={(e) => startResize(e, "right", "ew-resize")} className="absolute inset-y-3 right-0 z-20 w-1.5 cursor-ew-resize" />
                <div onMouseDown={(e) => startResize(e, "tl", "nwse-resize")} className="absolute left-0 top-0 z-20 h-4 w-4 cursor-nwse-resize" />
                <div onMouseDown={(e) => startResize(e, "tr", "nesw-resize")} className="absolute right-0 top-0 z-20 h-4 w-4 cursor-nesw-resize" />
                <div onMouseDown={(e) => startResize(e, "bl", "nesw-resize")} className="absolute bottom-0 left-0 z-20 h-4 w-4 cursor-nesw-resize" />
                <div onMouseDown={(e) => startResize(e, "br", "nwse-resize")} className="absolute bottom-0 right-0 z-20 h-4 w-4 cursor-nwse-resize" />
              </>
            )}

            {/* Header */}
            <div
              className="flex shrink-0 items-center justify-between px-5 py-3.5"
              style={{ borderBottom: `1px solid ${GLASS_BORDER}`, background: "rgba(255,255,255,0.35)" }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Bot className="h-6 w-6 shrink-0" style={{ color: ACCENT }} />
                <div className="min-w-0">
                  <h2 className="text-base font-semibold leading-tight text-slate-900">forgeVidhya AI</h2>
                  <p className="flex items-center gap-1 truncate text-[11px] text-slate-500">
                    <Eye className="h-3 w-3 shrink-0" style={{ color: ACCENT }} />
                    {pageTitle ? `Analysing: ${pageTitle.slice(0, 48)}` : "Reading this page…"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={clearChat} aria-label="Clear chat" title="Clear chat" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-800">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setIsFullScreen((f) => !f)} aria-label={isFullScreen ? "Exit full screen" : "Full screen"} title={isFullScreen ? "Exit full screen" : "Full screen"} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-800">
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close" title="Close" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="deepseek-scroll flex-1 space-y-3 overflow-y-auto px-5 py-4" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div className="mx-auto flex h-full max-w-3xl flex-col justify-end gap-3">
                {messages.map((m) =>
                  m.role === "system" ? (
                    <p key={m.id} className="py-1 text-center text-[11px] text-slate-500">{m.content}</p>
                  ) : (
                    <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          m.role === "user"
                            ? "rounded-br-sm text-white shadow-sm"
                            : "rounded-bl-sm border border-slate-300/50 bg-white/60 text-slate-800 backdrop-blur-sm"
                        )}
                        style={m.role === "user" ? { background: ACCENT } : undefined}
                      >
                        {m.role === "assistant" ? <MarkdownLite content={m.content} /> : <span className="whitespace-pre-wrap">{m.content}</span>}
                        <button
                          type="button"
                          onClick={() => copyMessage(m.id, m.content)}
                          aria-label="Copy message"
                          className="absolute -right-2 -top-2 hidden rounded-md bg-white/95 p-1.5 text-slate-500 ring-1 ring-slate-300/50 transition-colors hover:text-slate-800 group-hover:block"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        {copiedId === m.id && (
                          <span className="absolute -right-1 -top-6 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white">copied</span>
                        )}
                      </div>
                    </div>
                  )
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-300/50 bg-white/60 px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full"
                          style={{ background: ACCENT }}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 px-5 py-3.5" style={{ borderTop: `1px solid ${GLASS_BORDER}`, background: "rgba(255,255,255,0.35)" }}>
              <div className="mx-auto flex max-w-3xl items-center gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about this page…"
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-slate-300/60 bg-white/60 px-4 py-2.5 text-sm text-slate-800 outline-none backdrop-blur-sm transition-colors placeholder:text-slate-400 focus:border-[#2e6dff] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: ACCENT }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-slate-500">
                Enter to send · AI can make mistakes — double-check important details.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glass scrollbar for the message area */}
      <style>{`
        .deepseek-scroll::-webkit-scrollbar { width: 8px; }
        .deepseek-scroll::-webkit-scrollbar-track { background: transparent; }
        .deepseek-scroll::-webkit-scrollbar-thumb { background: rgba(46,109,255,0.3); border-radius: 9999px; }
        .deepseek-scroll::-webkit-scrollbar-thumb:hover { background: rgba(46,109,255,0.5); }
      `}</style>
    </>
  );
}

/* ============================================================
   MarkdownLite — a tiny, dependency-free, XSS-safe renderer.
   Builds React elements (never injects HTML). Tuned for the
   light panel: inherits the parent's dark slate text.
   ============================================================ */

function safeUrl(url: string): string | undefined {
  const u = url.trim();
  if (/^(https?:|mailto:)/i.test(u)) return u;
  if (u.startsWith("/") || u.startsWith("#")) return u;
  return undefined;
}

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;

  const rules: { re: RegExp; make: (m: RegExpMatchArray) => ReactNode }[] = [
    { re: /`([^`]+)`/, make: (m) => <code key={key++} className="rounded bg-slate-900/10 px-1 py-0.5 font-mono text-[0.85em]">{m[1]}</code> },
    { re: /\*\*([^*]+)\*\*/, make: (m) => <strong key={key++}>{renderInline(m[1])}</strong> },
    { re: /\*([^*]+)\*/, make: (m) => <em key={key++}>{renderInline(m[1])}</em> },
    { re: /_([^_]+)_/, make: (m) => <em key={key++}>{renderInline(m[1])}</em> },
    {
      re: /\[([^\]]+)\]\(([^)\s]+)\)/,
      make: (m) => {
        const href = safeUrl(m[2]);
        return href ? (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-[#2e6dff] underline underline-offset-2">
            {m[1]}
          </a>
        ) : (
          <span key={key++}>{m[1]}</span>
        );
      },
    },
  ];

  while (rest) {
    let bestIdx = Infinity;
    let bestMatch: RegExpMatchArray | null = null;
    let bestRule: (typeof rules)[number] | null = null;
    for (const rule of rules) {
      const m = rest.match(rule.re);
      if (m && m.index !== undefined && m.index < bestIdx) {
        bestIdx = m.index;
        bestMatch = m;
        bestRule = rule;
      }
    }
    if (!bestMatch || !bestRule) {
      out.push(rest);
      break;
    }
    if (bestIdx > 0) out.push(rest.slice(0, bestIdx));
    out.push(bestRule.make(bestMatch));
    rest = rest.slice(bestIdx + bestMatch[0].length);
  }
  return out;
}

function MarkdownLite({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={key++} className="my-1.5 overflow-x-auto rounded-lg bg-slate-900/10 p-2.5 font-mono text-xs">
          <code>{code.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push(
        <p key={key++} className="mt-1 font-display text-sm font-bold">{renderInline(heading[2])}</p>
      );
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-1 list-disc space-y-0.5 pl-5">
          {items.map((it, idx) => <li key={idx}>{renderInline(it)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-1 list-decimal space-y-0.5 pl-5">
          {items.map((it, idx) => <li key={idx}>{renderInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="whitespace-pre-wrap">
        {para.flatMap((p, idx) => (idx === 0 ? renderInline(p) : [<br key={`br-${idx}`} />, ...renderInline(p)]))}
      </p>
    );
  }

  return <div className="space-y-1.5">{blocks}</div>;
}
