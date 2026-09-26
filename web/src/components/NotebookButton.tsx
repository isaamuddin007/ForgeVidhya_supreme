import { useState } from "react";
import { motion } from "framer-motion";
import { NotebookPen } from "lucide-react";
import { useSound } from "@/components/sound-provider";

/**
 * NotebookButton — a floating launcher that sits next to the AI assistant and
 * opens Zoho Notebook in the SAME browser tab.
 *
 * Why a navigation and not an embed:
 * Zoho Notebook cannot be iframed. Hitting https://notebook.zoho.in redirects to
 * https://notebook.zoho.in/login.do, which responds with `X-Frame-Options: DENY`
 * (verified against the live endpoint). An <iframe> would therefore render a
 * blocked/blank frame for every user. We use the documented fallback instead:
 * a full-page, same-tab navigation.
 *
 * Returning to the app: we use location.assign() (NOT replace()), so forgeVidhya
 * stays in session history and the browser Back button brings the user straight
 * back to the page they left — one click out, one click back.
 */

const NOTEBOOK_URL = "https://notebook.zoho.in";

// Light frosted-glass launcher, parked in the bottom-right corner.
const GLASS_BG = "rgba(255, 255, 255, 0.7)";
const ACCENT = "#5170ff";
const GLASS_BORDER = "rgba(148, 163, 184, 0.32)";

export function NotebookButton() {
  const { playBlub } = useSound();
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    playBlub();
    setOpening(true);
    // Same tab. Keeps the app in history so Back returns to it.
    window.location.assign(NOTEBOOK_URL);
  };

  return (
    <motion.button
      type="button"
      onClick={open}
      aria-label="Open Notebook"
      aria-busy={opening}
      className="group fixed bottom-7 right-7 z-[70] grid h-14 w-14 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#5170ff]/30"
      style={{
        background: GLASS_BG,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${GLASS_BORDER}`,
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.85)",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.4 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {opening ? (
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: ACCENT, borderTopColor: "transparent" }}
        />
      ) : (
        <NotebookPen className="h-6 w-6" style={{ color: ACCENT }} />
      )}

      {/* hover label */}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        {opening ? "Opening…" : "Notebook"}
      </span>
    </motion.button>
  );
}
