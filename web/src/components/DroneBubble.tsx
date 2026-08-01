import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/components/sound-provider";

/** Generated hero art. */
const DRONE_SRC =
  "https://r2-pub.rork.com/projects/3d05n2z01udj8xowfpbok/assets/b7a03f05-2ef5-45ef-9257-832eb81eb3ae.png";
const CITY_SRC =
  "https://r2-pub.rork.com/projects/3d05n2z01udj8xowfpbok/assets/4037fc4a-869b-4872-9e19-8f58f833378a.png";

/**
 * DroneBubble — a small hovering drone that lives in the bubble-nav cluster,
 * right beside the Contact orb. Tapping it projects a sustainable city that
 * rises from the horizon across the whole page; tapping again reverses it.
 * Kept compact so it never wastes hero space.
 */
export function DroneBubble() {
  const { playBlub } = useSound();
  const [projecting, setProjecting] = useState(false);
  const [spin, setSpin] = useState(0);

  const toggle = () => {
    playBlub();
    setProjecting((p) => !p);
    setSpin((s) => s + 360);
  };

  return (
    <>
      {/* small drone button — sits beside the Contact orb */}
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={projecting ? "Hide the sustainable city" : "Reveal the sustainable city"}
        className="relative grid h-16 w-16 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { delay: 0.3 },
          scale: { type: "spring", stiffness: 320, damping: 18, delay: 0.3 },
          y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
        }}
        whileHover={{ scale: 1.18 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.img
          src={DRONE_SRC}
          alt="Interactive hovering drone"
          className="pointer-events-none h-12 w-12 select-none object-contain drop-shadow-[0_6px_14px_rgba(46,109,255,0.35)]"
          draggable={false}
          animate={{ rotateY: spin }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        />
        {/* hint pulse ring when idle */}
        {!projecting && (
          <motion.span
            className="absolute inset-1 -z-10 rounded-full border border-primary/40"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-foreground/80 opacity-0 transition-opacity hover:opacity-100">
          Drone
        </span>
      </motion.button>

      {/* full-screen holographic city projection */}
      <AnimatePresence>
        {projecting && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* translucent city hologram rising from the bottom */}
            <motion.div
              className="absolute inset-x-0 bottom-0 h-[85vh]"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0% 0 0 0)" }}
              exit={{ clipPath: "inset(100% 0 0 0)" }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="absolute inset-0 bg-cover bg-bottom mix-blend-screen"
                style={{
                  backgroundImage: `url(${CITY_SRC})`,
                  opacity: 0.28,
                  filter:
                    "grayscale(0.2) brightness(1.3) saturate(1.4) hue-rotate(190deg) contrast(1.1)",
                }}
              />
              {/* blue holographic tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-forge-mint/20 via-primary/10 to-transparent mix-blend-screen" />
              {/* scanlines */}
              <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, rgba(46,109,255,0.18) 0px, rgba(46,109,255,0.18) 1px, transparent 1px, transparent 4px)",
                }}
                animate={{ backgroundPositionY: ["0px", "4px"] }}
                transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
              />
              {/* travelling scan sweep */}
              <motion.div
                className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-forge-mint/25 to-transparent"
                initial={{ top: "100%" }}
                animate={{ top: ["100%", "-40%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* soft fade so the top blends into the page */}
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background to-transparent" />
            </motion.div>
            {/* flickering ambient glow */}
            <motion.div
              className="absolute inset-0 bg-forge-mint/5"
              animate={{ opacity: [0.4, 0.7, 0.35, 0.6] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
