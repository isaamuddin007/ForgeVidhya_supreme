import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Workflow, X } from "lucide-react";

// The standalone whiteboard tool is stored as a verbatim HTML document and
// imported as a raw string. It runs inside a sandboxed <iframe srcDoc> so its
// own Tailwind CDN / <style> / global <script> stay fully isolated from the
// React app (no CSS or global-scope collisions).
import whiteboardHtml from "@/tools/workflow-whiteboard.html?raw";

/**
 * WorkflowToolModal — a near-fullscreen overlay that hosts the AI Automation
 * whiteboard as an embedded, isolated tool screen (not a navigation). Closes on
 * the X button or Escape; body scroll is locked while open.
 */
export function WorkflowToolModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-background/80 p-3 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="AI Automation Whiteboard"
        >
          <motion.div
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-forge"
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                  <Workflow className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">AI Automation Whiteboard</p>
                  <p className="text-xs text-muted-foreground">
                    Hands-on tool · runs inside forgeVidhya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close tool"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <iframe
              title="AI Automation Whiteboard"
              srcDoc={whiteboardHtml}
              className="min-h-0 w-full flex-1 border-0"
              // Scoped permissions: run scripts, allow confirm() dialogs, allow
              // the JSON export download & popups. No allow-same-origin -> the
              // tool runs in an isolated null origin and can't touch the app.
              sandbox="allow-scripts allow-downloads allow-modals allow-popups"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
