import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Icon } from "@/components/ui/primitives";
import { useSound } from "@/components/sound-provider";
import { programCategories } from "@/lib/site";

/**
 * ProgramChooser — the floating, glowing 3-card overlay shown when the Programs
 * bubble is clicked. It does NOT navigate on open; picking a card routes to the
 * Programs page filtered to that category (/services?category=<id>).
 */
export function ProgramChooser({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { playBlub } = useSound();

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

  const choose = (id: string) => {
    playBlub();
    onClose();
    navigate(`/services?category=${id}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Choose a program category"
        >
          {/* backdrop — click to dismiss */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-background/70 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full glass-card text-foreground shadow-forge"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative grid w-full max-w-5xl gap-6 px-2 sm:grid-cols-3">
            {programCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => choose(cat.id)}
                className="group relative flex flex-col items-start rounded-3xl border border-white/40 p-6 text-left backdrop-blur-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                style={{
                  background: `linear-gradient(150deg, ${cat.from}cc, ${cat.to}cc)`,
                  boxShadow:
                    "inset 0 2px 8px rgba(255,255,255,0.4), 0 18px 50px -12px rgba(0,0,0,0.35)",
                }}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: [0, i % 2 === 0 ? -8 : 8, 0], scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  opacity: { delay: i * 0.08 },
                  scale: { type: "spring", stiffness: 300, damping: 18, delay: i * 0.08 },
                  y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                {/* glow */}
                <span
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] opacity-70 blur-2xl transition-opacity group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 35%, ${cat.from}, ${cat.to})`,
                  }}
                />
                {/* highlight shine */}
                <span className="pointer-events-none absolute left-6 top-4 h-5 w-10 rounded-full bg-white/50 blur-md" />

                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/25 text-white shadow-inner backdrop-blur">
                  <Icon name={cat.icon} size={26} className="text-white" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold text-white drop-shadow">
                  {cat.title}
                </h3>
                <p className="mt-1 text-sm text-white/90">{cat.blurb}</p>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/80">
                  {cat.programs.length} programs
                </span>
                <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-semibold text-white transition-transform group-hover:translate-x-1">
                  Explore <ArrowRight className="h-4 w-4" />
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
