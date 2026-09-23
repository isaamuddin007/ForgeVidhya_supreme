import { useState } from "react";
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
import { ProgramChooser } from "@/components/ProgramChooser";
import RoyalNavMenu from "@/components/RoyalNavMenu";
import { DroneBubble } from "@/components/DroneBubble";

export function BubbleNav() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted, playBlub } = useSound();
  const [chooserOpen, setChooserOpen] = useState(false);

  const go = (href: string) => {
    playBlub();
    navigate(href);
  };

  // The Programs bubble opens the floating category chooser instead of
  // navigating; picking a card there routes to the filtered Programs page.
  const handleBubble = (href: string) => {
    if (href === "/services") {
      playBlub();
      setChooserOpen(true);
      return;
    }
    go(href);
  };

  return (
    <>
    {/* In normal document flow (not fixed), so the nav scrolls away with the
        page instead of staying pinned to the top. */}
    <div className="pointer-events-none relative z-[100]">
      <div className="mx-auto flex max-w-7xl items-start justify-between px-4 pt-3 sm:px-6 lg:px-8">
        {/* left: brand logo — removed. The slot is held open so the controls
            on the right stay where they were. */}
        <div className="h-16 sm:h-20" aria-hidden="true" />

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

    <ProgramChooser open={chooserOpen} onClose={() => setChooserOpen(false)} />
    </>
  );
}
