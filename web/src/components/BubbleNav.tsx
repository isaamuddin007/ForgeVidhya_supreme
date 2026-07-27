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
import { cn } from "@/lib/utils";

type Bubble = {
  label: string;
  href: string;
  icon: typeof HomeIcon;
  /** Gradient tint per-bubble for a lively, candy-like cluster. */
  from: string;
  to: string;
};

const bubbles: Bubble[] = [
  { label: "Home", href: "/", icon: HomeIcon, from: "#00bfff", to: "#0080bf" },
  { label: "About", href: "/about", icon: User, from: "#66d9ff", to: "#00bfff" },
  {
    label: "Program",
    href: "/services",
    icon: GraduationCap,
    from: "#ff9500",
    to: "#cc7700",
  },
  {
    label: "Blogs",
    href: "/blog",
    icon: Newspaper,
    from: "#00bfff",
    to: "#ff9500",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail,
    from: "#ff9500",
    to: "#00bfff",
  },
];

/** A single glossy floating orb. */
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
      className="group relative grid place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      style={{ width: 64, height: 64 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, index % 2 === 0 ? -7 : 7, 0],
      }}
      transition={{
        opacity: { delay: index * 0.05 },
        scale: { type: "spring", stiffness: 320, damping: 18, delay: index * 0.05 },
        y: {
          duration: 3 + index * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      whileHover={{ scale: 1.28 }}
      whileTap={{ scale: 0.82 }}
    >
      {/* glow */}
      <span
        className="absolute inset-0 rounded-full opacity-60 blur-lg transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${bubble.from}, ${bubble.to})`,
        }}
      />
      {/* glass body */}
      <span
        className={cn(
          "relative grid h-16 w-16 place-items-center rounded-full border border-white/40 backdrop-blur-md",
          active && "ring-2 ring-white/80"
        )}
        style={{
          background: `linear-gradient(150deg, ${bubble.from}cc, ${bubble.to}cc)`,
          boxShadow:
            "inset 0 2px 6px rgba(255,255,255,0.55), 0 8px 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* highlight shine */}
        <span className="absolute left-3 top-2 h-4 w-6 rounded-full bg-white/70 blur-[2px]" />
        <Icon className="relative h-6 w-6 text-white drop-shadow" strokeWidth={2.4} />
      </span>
      {/* label */}
      <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-foreground/80 opacity-0 transition-opacity group-hover:opacity-100">
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-start justify-between px-4 pt-5 sm:px-6 lg:px-8">
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
            src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
            alt="forgeVidhya"
            className="h-16 w-auto rounded-2xl drop-shadow-md sm:h-20"
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

      {/* desktop: floating cluster centered under the top row */}
      <div className="pointer-events-auto mx-auto mt-2 hidden max-w-7xl justify-center gap-4 px-4 sm:flex">
        {bubbles.map((b, i) => (
          <Orb
            key={b.href}
            bubble={b}
            index={i}
            active={isActive(b.href)}
            onNavigate={handleBubble}
          />
        ))}
      </div>

      {/* mobile: expanding vertical cluster */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-auto mx-auto mt-4 grid max-w-xs grid-cols-3 place-items-center gap-6 px-4 pb-6 sm:hidden"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <ProgramChooser open={chooserOpen} onClose={() => setChooserOpen(false)} />
    </>
  );
}
