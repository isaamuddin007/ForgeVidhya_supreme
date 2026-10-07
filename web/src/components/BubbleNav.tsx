import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSound } from "@/components/sound-provider";
import { SiteSearch } from "@/components/SiteSearch";
import RoyalNavMenu from "@/components/RoyalNavMenu";
import { DroneBubble } from "@/components/DroneBubble";
import logoMarkUrl from "@/assets/logo-mark.png";
import wordmarkUrl from "@/assets/logo-wordmark.png";
import emblemUrl from "@/assets/emblem-india.png";

export function BubbleNav() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted, playBlub } = useSound();

  const go = (href: string) => {
    playBlub();
    navigate(href);
  };

  // Every nav item navigates, Programs included. It used to be intercepted
  // here and answered with a floating chooser of category cards, which meant
  // the Programs page itself was never reachable from the menu.
  const handleBubble = (href: string) => go(href);

  return (
    <>
    {/* In normal document flow (not fixed), so the nav scrolls away with the
        page instead of staying pinned to the top. */}
    <div className="pointer-events-none relative z-[100]">
      <div className="mx-auto flex max-w-7xl items-start justify-between px-4 pt-3 sm:px-6 lg:px-8">
        {/* left: the quill on its white plate, with the name beside it —
            the arrangement the design calls for. */}
        <div className="pointer-events-auto flex items-center gap-3">
          <motion.button
            type="button"
            onClick={() => go("/")}
            aria-label="forgeVidhya home"
            className="grid place-items-center rounded-xl bg-white/90 p-1.5 shadow-[0_6px_18px_-8px_rgba(40,20,70,0.5)] ring-1 ring-white/70 outline-none backdrop-blur-sm focus-visible:ring-4 focus-visible:ring-primary/40 sm:p-2"
            whileHover={{ scale: 1.06, rotate: -2 }}
            whileTap={{ scale: 0.92 }}
          >
            <img
              src={logoMarkUrl}
              alt="Forge Vidhya"
              className="h-12 w-auto sm:h-16"
              draggable={false}
            />
          </motion.button>

          <button
            type="button"
            onClick={() => go("/")}
            aria-label="forgeVidhya home"
            className="hidden outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:block"
          >
            <img
              src={wordmarkUrl}
              alt="Forge Vidhya — Inspiring the nation's minds"
              className="h-auto w-[min(34vw,300px)] select-none"
              draggable={false}
              width={837}
              height={316}
            />
          </button>
        </div>

        {/* the design's national badge, between the name and the controls */}
        <div className="pointer-events-none hidden items-center gap-2 self-center lg:flex">
          <img
            src={emblemUrl}
            alt=""
            className="h-11 w-auto select-none opacity-90"
            draggable={false}
            width={48}
            height={74}
          />
          <span className="text-[0.66rem] font-extrabold uppercase leading-tight tracking-[0.06em] text-[#1a1a1e]">
            Made proudly
            <br />
            <span className="text-primary">for India</span>
          </span>
        </div>

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
          {/* the nav now lives behind this trigger */}
          <RoyalNavMenu onNavigate={handleBubble} />
        </div>
      </div>

      {/* the drone kept its place beside the old Contact chip; with the
          chips gone it sits with the header controls instead */}
      <div className="pointer-events-auto mx-auto -mt-1 flex max-w-7xl items-center justify-end px-4 sm:px-6 lg:px-8">
        <DroneBubble />
      </div>
    </div>

    </>
  );
}
