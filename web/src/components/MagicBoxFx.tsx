import { useEffect } from 'react';

/**
 * MagicBoxFx — the part of the card treatment that CSS cannot do on its own:
 * where the pointer is inside a card, so the glow can follow it and the card
 * can tilt towards it.
 *
 * One delegated listener on the window rather than an effect per card. With
 * roughly fifteen cards on a page, per-card listeners would mean fifteen
 * subscriptions and fifteen React effects to tear down on every navigation;
 * this is one of each, and it finds the card under the pointer with a single
 * `closest` call.
 *
 * The styles it writes are only ever `--tilt-x`, `--tilt-y`, `--glow-x` and
 * `--glow-y`. The card's transform is assembled from those variables in CSS,
 * so this never fights the lift that `:hover` applies.
 */
const MAX_TILT = 5; // degrees — past about six it stops reading as depth

export default function MagicBoxFx() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // A tilt needs a pointer to follow. On touch there isn't one, and the
    // work would be wasted on every scroll.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let active: HTMLElement | null = null;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;
    let frame = 0;

    const clear = (el: HTMLElement) => {
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    };

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      pending = null;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = (x - r.left) / r.width - 0.5;
      const py = (y - r.top) / r.height - 0.5;
      el.style.setProperty('--tilt-x', `${(-py * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(px * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty('--glow-x', `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--glow-y', `${((py + 0.5) * 100).toFixed(1)}%`);
    };

    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const box = target?.closest?.('.card-hover') as HTMLElement | null;

      if (box !== active) {
        if (active) clear(active);
        active = box;
      }
      if (!box) return;

      // getBoundingClientRect forces layout, so it happens once per frame
      // rather than once per event.
      pending = { el: box, x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
      if (active) clear(active);
    };
  }, []);

  return null;
}
