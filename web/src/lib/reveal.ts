import { useReducedMotion } from "framer-motion";
import type { Variants, Transition } from "framer-motion";

/**
 * Scroll reveal — the single source of truth for how blocks enter the page.
 *
 * Cards, steps and text blocks do not sit on the page already. They start
 * invisible, slightly smaller and a little lower, then drop into their real
 * place as their section reaches the viewport — and hide again once they
 * leave the frame, so scrolling back up replays the entrance.
 *
 * framer-motion's `whileInView` is an IntersectionObserver underneath; using
 * it rather than a separate observer keeps one system driving these nodes.
 * A second observer setting classes would lose to the inline styles
 * framer-motion already writes onto the very same elements.
 */

export const REVEAL_DURATION = 0.6;
export const REVEAL_EASE: Transition["ease"] = [0.22, 1, 0.36, 1]; // ease-out

export const revealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 28 },
  shown: { opacity: 1, scale: 1, y: 0 },
};

/**
 * `once: false` is what makes a block leave again when it scrolls out of
 * frame. The negative margin holds the trigger back until the element is
 * properly inside the viewport rather than clipping its edge.
 */
export const revealViewport = { once: false, margin: "-80px" } as const;

export const revealTransition = (delay = 0): Transition => ({
  duration: REVEAL_DURATION,
  delay,
  ease: REVEAL_EASE,
});

/**
 * Every prop a `motion` element needs to reveal on entry and hide on exit.
 * Spread it onto the element: `<motion.div {...useReveal(0.1)} />`.
 *
 * With "reduce motion" set, this returns nothing at all — the element renders
 * in its final state with no initial, no observer and no transition, so the
 * page is simply static.
 */
export function useReveal(delay = 0) {
  const reduced = useReducedMotion();
  return reduced ? {} : revealProps(delay);
}

/**
 * The same thing for a list: call this once in the component, then apply the
 * returned function per item — `{...reveal(i * 0.1)}` — to stagger a row of
 * cards. A factory rather than the hook itself, because a hook must not be
 * called inside a `.map()`.
 */
export function useRevealStagger() {
  const reduced = useReducedMotion();
  return (delay = 0) => (reduced ? {} : revealProps(delay));
}

function revealProps(delay: number) {
  return {
    variants: revealVariants,
    initial: "hidden",
    whileInView: "shown",
    viewport: revealViewport,
    transition: revealTransition(delay),
  } as const;
}
