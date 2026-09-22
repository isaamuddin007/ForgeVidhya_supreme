import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home as HomeIcon,
  User,
  GraduationCap,
  Newspaper,
  Mail,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Plus,
  X,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSound } from "@/components/sound-provider";
import { SiteSearch } from "@/components/SiteSearch";
import { ProgramChooser } from "@/components/ProgramChooser";
import { DroneBubble } from "@/components/DroneBubble";
import { cn } from "@/lib/utils";

type Bubble = {
  label: string;
  href: string;
  icon: typeof HomeIcon;
  /** Solid brand fill per-bubble: blue = interface, orange = important. */
  color: string;
};

// Two oranges rather than one, so the bubbles keep the alternating rhythm
// they had when half of them were blue. Set inline on each label and icon,
// so these constants are the only place they can be changed.
const BRAND_AMBER = "#ffa70f";
const BRAND_ORANGE = "#ffa70f";

const bubbles: Bubble[] = [
  { label: "Home", href: "/", icon: HomeIcon, color: BRAND_AMBER },
  { label: "About", href: "/about", icon: User, color: BRAND_AMBER },
  { label: "Program", href: "/services", icon: GraduationCap, color: BRAND_ORANGE },
  { label: "Blogs", href: "/blog", icon: Newspaper, color: BRAND_AMBER },
  { label: "Contact", href: "/contact", icon: Mail, color: BRAND_ORANGE },
];

/** A single glass-textured navigation chip (rounded rectangle). */
function Orb({
  bubble,
  active,
  index,
  onNavigate,
}: {
  bubble: Bubble;
  active: boolean;
  index: number;
  onNavigate: (href: string) => void;
}) {
  const Icon = bubble.icon;
  return (
    <motion.button
      type="button"
      onClick={() => onNavigate(bubble.href)}
      aria-label={`Go to ${bubble.label}`}
      aria-current={active ? "page" : undefined}
      className="group relative inline-flex items-center gap-2 rounded-xl border bg-card/50 px-3.5 py-2.5 outline-none backdrop-blur-xl transition-colors focus-visible:ring-4 focus-visible:ring-primary/30"
      style={{
        borderColor: active ? bubble.color : "hsl(var(--border) / 0.6)",
        boxShadow: active
          ? `inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 1px ${bubble.color}, 0 10px 24px -12px ${bubble.color}`
          : "inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 20px -14px rgba(15,23,42,0.35)",
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 22, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.96 }}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.4} style={{ color: bubble.color }} />
      <span
        className={cn("text-sm font-semibold leading-none", !active && "text-foreground/80")}
        style={active ? { color: bubble.color } : undefined}
      >
        {bubble.label}
      </span>
    </motion.button>
  );
}

/**
 * BubbleNav — floating bubble navigation that replaces the top navbar.
 * Orbs inflate on hover, squish-pop + "blub" on click, and route between pages.
 * Includes mute and dark-mode orbs. Collapsible on small screens.
 */
export function BubbleNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted, playBlub } = useSound();
  const [open, setOpen] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const go = (href: string) => {
    playBlub();
    navigate(href);
    setOpen(false);
  };

  // The Programs bubble opens the floating category chooser instead of
  // navigating; picking a card there routes to the filtered Programs page.
  const handleBubble = (href: string) => {
    if (href === "/services") {
      playBlub();
      setChooserOpen(true);
      setOpen(false);
      return;
    }
    go(href);
  };

  return (
    <>
    {/* In normal document flow (not fixed), so the nav scrolls away with the
        page instead of staying pinned to the top. */}
    <div className="pointer-events-none relative z-50">
      <div className="mx-auto flex max-w-7xl items-start justify-between px-4 pt-3 sm:px-6 lg:px-8">
        {/* left: brand logo */}
        <motion.button
          type="button"
          onClick={() => go("/")}
          aria-label="forgeVidhya home"
          className="pointer-events-auto rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          whileHover={{ scale: 1.08, rotate: -2 }}
          whileTap={{ scale: 0.9 }}
        >
          <img
            src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
            alt="forgeVidhya"
            className="h-16 w-auto drop-shadow-md sm:h-20"
            draggable={false}
          />
        </motion.button>

        {/* right controls: search + mute + theme + mobile toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <SiteSearch />
          <motion.button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            className="grid h-11 w-11 place-items-center rounded-full glass-card text-foreground shadow-forge"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </motion.button>
          <motion.button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="grid h-11 w-11 place-items-center rounded-full glass-card text-foreground shadow-forge"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </motion.button>
          {/* mobile expand toggle */}
          <motion.button
            type="button"
            onClick={() => {
              playBlub();
              setOpen((o) => !o);
            }}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-full bg-forge-gradient text-white shadow-forge sm:hidden"
            whileTap={{ scale: 0.85 }}
          >
            {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      {/* desktop: glass nav chips centered just under the top row */}
      <div className="pointer-events-auto mx-auto -mt-1 hidden max-w-7xl items-center justify-center gap-2.5 px-4 sm:flex">
        {bubbles.map((b, i) => (
          <Orb
            key={b.href}
            bubble={b}
            index={i}
            active={isActive(b.href)}
            onNavigate={handleBubble}
          />
        ))}
        {/* small interactive drone — sits just beside the Contact orb */}
        <DroneBubble />
      </div>

      {/* mobile: expanding vertical cluster */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-auto mx-auto mt-2 flex max-w-sm flex-wrap items-center justify-center gap-2 px-4 pb-6 sm:hidden"
          >
            {bubbles.map((b, i) => (
              <Orb
                key={b.href}
                bubble={b}
                index={i}
                active={isActive(b.href)}
                onNavigate={handleBubble}
              />
            ))}
            {/* small interactive drone — beside the Contact orb */}
            <DroneBubble />
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <ProgramChooser open={chooserOpen} onClose={() => setChooserOpen(false)} />
    </>
  );
}
