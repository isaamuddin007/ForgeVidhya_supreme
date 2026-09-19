import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useReveal } from "@/lib/reveal";

const WELCOME_TEXT = "building for the future of technology";
const WELCOME_KEY = "ff-welcomed";

/**
 * HeroStage — a clean, compact EdTech hero. On the very first visit a welcome
 * phrase materializes gradually out of thin air. The interactive drone now
 * lives in the bubble-nav cluster (see DroneBubble), so the hero stays tight
 * and content-forward instead of a large empty stage.
 */
export function HeroStage() {
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

  const words = WELCOME_TEXT.split(" ");

  // The headline keeps its first-visit materialize; the subhead and buttons
  // still wait for it to finish before they drop in.
  const headlineReveal = useReveal();
  const subheadReveal = useReveal(firstVisit ? 2.4 : 0.1);
  const buttonsReveal = useReveal(firstVisit ? 2.6 : 0.2);

  return (
    <section className="relative overflow-hidden">
      {/* atmosphere */}
      <div className="absolute inset-0 -z-10 bg-forge-radial" />
      <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />

      <div className="mx-auto flex min-h-[38vh] max-w-4xl flex-col items-center justify-center px-4 pb-10 pt-6 text-center sm:px-6 lg:px-8">
        {/* welcome phrase */}
        <motion.h1
          className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          {...headlineReveal}
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
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          {...subheadReveal}
        >
          AI and engineering skills tier-3 colleges skip — built around shipping
          real things.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          {...buttonsReveal}
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-xl bg-[#28272f] px-6 py-3 text-base font-semibold text-white shadow-forge transition-transform hover:scale-[1.03] active:scale-95"
          >
            Explore programs <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            Apply now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
