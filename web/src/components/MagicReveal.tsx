import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { useSound } from "@/components/sound-provider";
import { cn } from "@/lib/utils";

/**
 * MagicReveal — a collapsed titled bubble/card that magically reveals its
 * content on click with a springy fade/expand. Plays the "blub" sound each
 * toggle. Used to make section text "appear magically" instead of scrolling.
 */
export function MagicReveal({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
  accent = "sky",
  className,
  anchorId,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  accent?: "sky" | "blue" | "red" | "mint";
  className?: string;
  /** When the URL hash matches this id, the bubble auto-opens (used by site search). */
  anchorId?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { playBlub } = useSound();
  const { hash } = useLocation();

  useEffect(() => {
    if (anchorId && hash === `#${anchorId}`) {
      setOpen(true);
    }
  }, [anchorId, hash]);

  const accents: Record<string, string> = {
    sky: "from-forge-sky/25 to-transparent",
    blue: "from-primary/20 to-transparent",
    red: "from-forge-red/20 to-transparent",
    mint: "from-forge-mint/40 to-transparent",
  };

  const toggle = () => {
    playBlub();
    setOpen((o) => !o);
  };

  return (
    <div
      id={anchorId}
      className={cn(
        "relative scroll-mt-28 overflow-hidden rounded-3xl border border-border/60 glass-card shadow-forge",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br",
          accents[accent]
        )}
      />
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-7 sm:py-6"
      >
        {icon && (
          <motion.span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge"
            animate={{ scale: open ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.4 }}
          >
            {icon}
          </motion.span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-display text-lg font-bold tracking-tight sm:text-xl">
            {title}
            {!open && (
              <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-primary" />
            )}
          </span>
          {subtitle && (
            <span className="mt-1 block text-sm text-muted-foreground">
              {subtitle}
            </span>
          )}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/70 text-primary"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: "spring", stiffness: 200, damping: 26 },
              opacity: { duration: 0.35 },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: 12, filter: "blur(6px)" }}
              animate={{ y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="px-5 pb-6 sm:px-7 sm:pb-7"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
