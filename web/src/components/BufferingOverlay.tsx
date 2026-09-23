import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * BufferingOverlay — the loading curtain, centred over the whole site.
 *
 * Two moments are covered, by two different elements.
 *
 * The first paint is covered by the boot curtain in index.html. It has to be
 * plain markup: a React component cannot cover the load it is itself waiting
 * on, and measuring the first version of this showed exactly that — a quarter
 * of a second in, the overlay was not in the DOM yet. This component retires
 * that one once the page has really finished loading.
 *
 * Every tab change after that is covered by the element below. The routes are
 * imported eagerly, so a route change costs no network time and would
 * otherwise be instantaneous; the curtain holds for a beat so the swap reads
 * as a load.
 *
 * The styles for both live in index.html, for the same reason the boot
 * curtain does.
 */

/** Never flash on first paint: hold at least this long even if load is instant. */
const FIRST_MIN = 900;
/** How long the curtain stays up when a tab is clicked. */
const ROUTE_HOLD = 650;
/** A stalled asset must never leave the site stuck behind the curtain. */
const SAFETY_CAP = 5000;

export function BufferingOverlay() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);

  // Retire the boot curtain once the page has actually loaded.
  useEffect(() => {
    const boot = document.getElementById("boot-buffering");
    if (!boot) return;

    let done = false;
    const start = performance.now();

    const retire = () => {
      if (done) return;
      done = true;
      boot.classList.remove("visible");
      // Let the 250ms fade finish before the node goes.
      window.setTimeout(() => boot.remove(), 400);
    };

    const finish = () => {
      const left = Math.max(0, FIRST_MIN - (performance.now() - start));
      window.setTimeout(retire, left);
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    const cap = window.setTimeout(retire, SAFETY_CAP);

    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(cap);
    };
  }, []);

  // Every tab change after the first render.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), ROUTE_HOLD);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div
      id="buffering"
      className={`buffering-overlay${visible ? " visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      <img src="/logo-buffering.png" alt="" />
      <span className="label">Loading</span>
    </div>
  );
}
