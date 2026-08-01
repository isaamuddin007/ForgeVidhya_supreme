import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X, Minus, Maximize2, Eye } from "lucide-react";
import { useSound } from "@/components/sound-provider";
import { cn } from "@/lib/utils";

/**
 * DeepSeekAssistant — a floating AI helper that lives on every page.
 *
 * Clicking the launcher opens a chat window. On each question it captures the
 * *rendered* page (title, route, headings, visible text, action labels) and
 * sends it to the backend proxy (`/api/deepseek/chat`), which forwards it to
 * DeepSeek with the server-side key. So the assistant genuinely "sees" what the
 * user is looking at and can answer about it or guide them around the site.
 *
 * Notes:
 * - The API key never touches the browser; only the backend holds it.
 * - "Vision" here means the page's DOM text/structure, not image vision —
 *   deepseek-chat is a text model.
 */

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000";
const CHAT_ENDPOINT = `${API_URL}/api/deepseek/chat`;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
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

/** Snapshot of the live page, sent to the backend as context. */
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus the input when the window opens.
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMinimized]);

  const toggleOpen = () => {
    playBlub();
    setIsOpen((o) => !o);
    setIsMinimized(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      at: Date.now(),
    };

    // History = the conversation so far (excludes the seeded welcome line).
    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          page: extractPageContext(),
          history,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.message, at: Date.now() },
      ]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${msg}`,
          at: Date.now(),
        },
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

  return (
    <>
      {/* Launcher */}
      <motion.button
        type="button"
        onClick={toggleOpen}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#2e6dff] text-white shadow-[0_8px_28px_rgba(46,109,255,0.45)] outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* soft idle pulse */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#2e6dff]"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="h-7 w-7" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-card fixed bottom-24 right-4 z-40 flex w-[min(90vw,21rem)] flex-col overflow-hidden rounded-3xl text-foreground shadow-2xl ring-1 ring-white/10 sm:right-6"
            style={{ height: isMinimized ? "auto" : "min(62vh, 520px)" }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            role="dialog"
            aria-label="forgeVidhya AI assistant"
          >
            {/* Header (translucent glass, blue-tinted) */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-[#2e6dff]/10 px-4 py-3 text-foreground backdrop-blur-sm">
              <div className="flex min-w-0 items-center gap-2">
                <Bot className="h-5 w-5 shrink-0 text-[#2e6dff]" />
                <span className="truncate font-semibold">forgeVidhya AI</span>
                <span className="hidden items-center gap-1 rounded-full bg-[#2e6dff]/15 px-2 py-0.5 text-[10px] font-medium text-[#2e6dff] sm:inline-flex">
                  <Eye className="h-3 w-3" /> sees this page
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized((m) => !m)}
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                  className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-foreground/10"
                >
                  {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minus className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-foreground/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                          m.role === "user"
                            ? "rounded-br-sm bg-[#2e6dff] text-white shadow-sm"
                            : "rounded-bl-sm border border-border/50 bg-foreground/5 text-foreground backdrop-blur-sm"
                        )}
                      >
                        {m.role === "assistant" ? (
                          <MarkdownLite content={m.content} />
                        ) : (
                          <span className="whitespace-pre-wrap">{m.content}</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border/50 bg-foreground/5 px-4 py-3 backdrop-blur-sm">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="h-2 w-2 rounded-full bg-muted-foreground"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="shrink-0 border-t border-border/50 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Ask about this page…"
                      disabled={isLoading}
                      className="flex-1 rounded-xl border border-border/50 bg-background/50 px-3.5 py-2 text-sm text-foreground outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => void send()}
                      disabled={!input.trim() || isLoading}
                      aria-label="Send"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2e6dff] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                    AI can make mistakes — double-check important details.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================
   MarkdownLite — a tiny, dependency-free, XSS-safe renderer.
   Supports: headings, bold/italic, inline code, fenced code,
   ordered/unordered lists, links, and paragraphs. It builds
   React elements (never injects HTML).
   ============================================================ */

function safeUrl(url: string): string | undefined {
  const u = url.trim();
  if (/^(https?:|mailto:)/i.test(u)) return u;
  if (u.startsWith("/") || u.startsWith("#")) return u; // in-app / anchor
  return undefined; // block javascript:, data:, etc.
}

/** Inline formatting within a single line of text. */
function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;

  const rules: { re: RegExp; make: (m: RegExpMatchArray) => ReactNode }[] = [
    { re: /`([^`]+)`/, make: (m) => <code key={key++} className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]">{m[1]}</code> },
    { re: /\*\*([^*]+)\*\*/, make: (m) => <strong key={key++}>{renderInline(m[1])}</strong> },
    { re: /\*([^*]+)\*/, make: (m) => <em key={key++}>{renderInline(m[1])}</em> },
    { re: /_([^_]+)_/, make: (m) => <em key={key++}>{renderInline(m[1])}</em> },
    {
      re: /\[([^\]]+)\]\(([^)\s]+)\)/,
      make: (m) => {
        const href = safeUrl(m[2]);
        return href ? (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">
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

    // Fenced code block
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre key={key++} className="my-1.5 overflow-x-auto rounded-lg bg-foreground/10 p-2.5 font-mono text-xs">
          <code>{code.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push(
        <p key={key++} className="mt-1 font-display text-sm font-bold">
          {renderInline(heading[2])}
        </p>
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-1 list-disc space-y-0.5 pl-5">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-1 list-decimal space-y-0.5 pl-5">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (gather consecutive non-blank, non-special lines)
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
        {para.flatMap((p, idx) =>
          idx === 0 ? renderInline(p) : [<br key={`br-${idx}`} />, ...renderInline(p)]
        )}
      </p>
    );
  }

  return <div className="space-y-1.5">{blocks}</div>;
}
