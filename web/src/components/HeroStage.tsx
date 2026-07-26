import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/components/sound-provider";

const WELCOME_TEXT = "building for the future of technology";
const WELCOME_KEY = "ff-welcomed";

/** Generated hero art. */
const DRONE_SRC =
  "https://r2-pub.rork.com/projects/3d05n2z01udj8xowfpbok/assets/b7a03f05-2ef5-45ef-9257-832eb81eb3ae.png";
const CITY_SRC =
  "https://r2-pub.rork.com/projects/3d05n2z01udj8xowfpbok/assets/4037fc4a-869b-4872-9e19-8f58f833378a.png";

/**
 * HeroStage — a clean, minimal hero stage. A realistic drone gently hovers up
 * and down. Tapping it turns the drone around and projects a sustainable city
 * that rises from the horizon; tapping again reverses it. On the very first
 * visit, a welcome phrase materializes gradually out of thin air.
 */
export function HeroStage() {
  const { playBlub } = useSound();
  const [projecting, setProjecting] = useState<boolean>(false);
  const [spin, setSpin] = useState<number>(0);
  const [firstVisit, setFirstVisit] = useState<boolean>(false);
  const checked = useRef<boolean>(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    try {
      const seen = localStorage.getItem(WELCOME_KEY);
      if (!seen) {
        setFirstVisit(true);
        localStorage.setItem(WELCOME_KEY, "1");
      }
    } catch {
      // ignore storage errors — just skip the one-time intro
    }
  }, []);

  const toggle = () => {
    playBlub();
    setProjecting((p) => !p);
    setSpin((s) => s + 360);
  };

  const words = WELCOME_TEXT.split(" ");

  return (
    <section className="relative overflow-hidden">
      {/* ===== full-screen holographic city projection ===== */}
      <AnimatePresence>
        {projecting && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
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
              {/* cyan holographic tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-forge-mint/20 via-primary/10 to-transparent mix-blend-screen" />
              {/* scanlines */}
              <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, rgba(0,191,255,0.18) 0px, rgba(0,191,255,0.18) 1px, transparent 1px, transparent 4px)",
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

      {/* atmosphere */}
      <div className="absolute inset-0 -z-10 bg-forge-radial" />
      <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
      <div className="absolute -top-24 -left-24 -z-10 h-72 w-72 rounded-full bg-forge-dew/60 blur-3xl animate-pulse-glow" />
      <div className="absolute -top-10 right-0 -z-10 h-72 w-72 rounded-full bg-forge-mint/20 blur-3xl animate-pulse-glow" />

      <div className="mx-auto flex min-h-[68vh] max-w-5xl flex-col items-center justify-center px-4 pb-16 pt-10 text-center sm:px-6 lg:px-8">
        {/* welcome phrase */}
        <motion.h1
          className="mb-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
          initial={firstVisit ? "hidden" : "shown"}
          animate="shown"
        >
          {words.map((word, wi) => (
            <span key={word + wi} className="mr-[0.35ch] inline-block">
              {word.split("").map((ch, ci) => (
                <motion.span
                  key={ch + ci}
                  className="inline-block text-forge-gradient"
                  variants={{
                    hidden: { opacity: 0, y: 12, filter: "blur(10px)" },
                    shown: { opacity: 1, y: 0, filter: "blur(0px)" },
                  }}
                  transition={{
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1],
                    delay: firstVisit ? 0.4 + (wi * 6 + ci) * 0.045 : 0,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="mb-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: firstVisit ? 2.4 : 0.3, duration: 0.8 }}
        >
          Tap the drone to reveal what we're building.
        </motion.p>

        {/* stage */}
        <div className="relative z-40 flex w-full items-end justify-center">
          {/* projection beam from the drone */}
          <AnimatePresence>
            {projecting && (
              <motion.div
                className="pointer-events-none absolute bottom-0 left-1/2 top-1/2 z-0 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "140px solid transparent",
                  borderRight: "140px solid transparent",
                  borderBottom: "260px solid rgba(0,191,255,0.16)",
                  filter: "blur(10px)",
                }}
              />
            )}
          </AnimatePresence>

          {/* soft breathing shadow */}
          <motion.div
            className="absolute bottom-2 left-1/2 -z-0 h-4 w-40 -translate-x-1/2 rounded-full bg-foreground/25 blur-md"
            animate={{ scaleX: [1, 0.82, 1], opacity: [0.35, 0.22, 0.35] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* drone */}
          <motion.button
            type="button"
            onClick={toggle}
            aria-label={projecting ? "Hide the sustainable city" : "Reveal the sustainable city"}
            className="relative z-20 mb-6 cursor-pointer rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            whileTap={{ scale: 0.94 }}
          >
            <motion.div
              animate={{ rotateY: spin }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src={DRONE_SRC}
                alt="Interactive hovering drone"
                className="pointer-events-none h-40 w-40 select-none object-contain drop-shadow-[0_10px_25px_rgba(0,51,255,0.35)] sm:h-52 sm:w-52"
                draggable={false}
              />
            </motion.div>
            {/* hint pulse ring */}
            {!projecting && (
              <motion.span
                className="absolute inset-0 -z-10 rounded-full border border-primary/40"
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
