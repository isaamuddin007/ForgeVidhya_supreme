import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useReveal } from "@/lib/reveal";

/**
 * HeroStage — the front page, built to the supplied design.
 *
 * The two mascots stand at the left, the headline and standfirst sit to the
 * right of them, and the name has moved out of here into the header beside
 * the quill, which is where the design puts it.
 *
 * The wording is the design's, kept to the letter.
 */
const TITLE = "Bharat's tech platform building next genration engineers";
const SUBTITLE =
  "This isn't you average Edtech platform. we solve, not memorize";

export function HeroStage() {
  const mascotReveal = useReveal(0.05);
  const titleReveal = useReveal(0.15);
  const subReveal = useReveal(0.3);
  const buttonsReveal = useReveal(0.45);

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-end gap-6 px-4 pb-6 pt-2 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10 lg:px-8">
        {/* the two mascots, standing on the foot of the page */}
        <motion.div className="order-2 flex justify-center lg:order-1 lg:justify-start" {...mascotReveal}>
          <img
            src="/mascots.png"
            alt="The two forgeVidhya mascots"
            className="h-auto w-[min(78vw,340px)] select-none drop-shadow-[0_18px_28px_rgba(40,20,70,0.28)] lg:w-full lg:max-w-[380px]"
            draggable={false}
            width={332}
            height={381}
          />
        </motion.div>

        <div className="order-1 pt-4 text-center lg:order-2 lg:pb-14 lg:text-right">
          <motion.h1 className="hero-title" {...titleReveal}>
            {TITLE}
          </motion.h1>

          <motion.p className="hero-subtitle" {...subReveal}>
            {SUBTITLE}
          </motion.p>

          <motion.div
            className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-end"
            {...buttonsReveal}
          >
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-xl bg-[#d7b460] px-6 py-3 text-base font-semibold text-white shadow-forge transition-transform hover:scale-[1.03] active:scale-95"
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
      </div>

      <style>{`
        /* The headline and standfirst carry their colours here rather than
           through a utility class: the design names them exactly, sampled
           from the artwork as #a60368 and #11103f. */
        .hero-title {
          font-family: 'Style Script', 'Segoe Script', 'Brush Script MT', cursive;
          font-weight: 400;
          color: #a70066;
          font-size: clamp(2.1rem, 5.2vw, 4rem);
          line-height: 1.12;
          letter-spacing: 0.01em;
          margin: 0;
        }
        .hero-subtitle {
          font-family: 'Style Script', 'Segoe Script', 'Brush Script MT', cursive;
          font-weight: 400;
          color: #11103f;
          font-size: clamp(1.05rem, 2.1vw, 1.6rem);
          line-height: 1.35;
          margin: 0.9rem 0 0;
        }
      `}</style>
    </section>
  );
}
