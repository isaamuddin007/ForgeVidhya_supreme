import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { CourseArtifact } from "@/lib/artifacts";

/**
 * ArtifactModal — opens a course's hands-on artifact in a full-frame overlay
 * that fills the website window. The artifact is a standalone HTML document
 * rendered inside a sandboxed iframe (srcDoc), so its scripts run isolated from
 * the app: `allow-scripts` runs its JS, `allow-modals` lets its Clear/Run
 * confirm()/alert() work — no `allow-same-origin`, so it can't touch the app's
 * origin, cookies, or storage.
 */
export function ArtifactModal({
  artifact,
  open,
  onClose,
}: {
  artifact: CourseArtifact | null;
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
      {open && artifact && (
        <motion.div
          className="fixed inset-0 z-[95] flex flex-col bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={artifact.title}
        >
          {/* slim header bar so the user can always get back to the site */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 bg-card/95 px-4 backdrop-blur">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {artifact.title}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" /> Close
            </button>
          </div>

          {/* the artifact itself — fills the rest of the frame */}
          <iframe
            title={artifact.title}
            srcDoc={artifact.html}
            sandbox={artifact.sandbox ?? "allow-scripts allow-modals"}
            className="min-h-0 w-full flex-1 border-0"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
