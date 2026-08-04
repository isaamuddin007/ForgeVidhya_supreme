import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";

/**
 * SiteAnnouncement — read-only banner showing the message the admin published
 * from the dashboard (PUT /api/admin/content). Everyone sees it; only the admin
 * can change it. Renders nothing when no announcement is set or the API is
 * unreachable, so the page is unaffected when the backend is down.
 *
 * The value is rendered as plain text (never HTML), and the backend strips tags
 * on write, so a stored string can't execute as script.
 */

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000";

export function SiteAnnouncement() {
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/content`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.success && typeof d.content === "string") setText(d.content.trim());
      })
      .catch(() => {
        /* backend offline — simply show nothing */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!text) return null;

  return (
    <motion.div
      className="mx-auto mb-2 mt-4 flex max-w-4xl items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 sm:px-6"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="status"
    >
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
    </motion.div>
  );
}
