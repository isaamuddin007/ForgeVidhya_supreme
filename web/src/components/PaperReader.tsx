import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import sheetUrl from "@/assets/paper-sheet.png";

/**
 * PaperReader — an article printed onto sheets of the house paper.
 *
 * Nothing from the article renders loose on the page. The masthead, the
 * standfirst, the byline and every paragraph are laid onto a sheet, and when
 * a sheet is full the next one is flipped up over the spiral binding.
 *
 * Pagination is measured, not guessed. The blocks are rendered once into a
 * hidden sheet of the exact content width, each block's real height is read
 * back, and blocks are packed into sheets against the real content height —
 * so a sheet never overflows and never breaks mid-paragraph.
 */

/** The artwork is 453 x 641, and the sheet keeps that ratio exactly so the
 *  ribbon never stretches. */
const SHEET_RATIO = 641 / 453;

/** Margins as a fraction of the sheet, kept clear of the ribbon.
 *
 *  The ribbon is a wedge over the top right: measured off the artwork,
 *  including its soft fade, it reaches 49% of the way down and, at the
 *  height the first line sits at, its inner edge is 78.9% across. So the
 *  column has to stop short of that, and the right margin is much the wider
 *  of the two — the flourish lives in it.
 *
 *  It cannot instead be a float the text wraps around. Every block is
 *  measured once, in a hidden sheet at one fixed width, before the packer
 *  knows which sheet it will land on; a column that changed width with
 *  height would measure at one width and render at another, and the sheets
 *  would overflow. A uniform column is what this paginator can honour.
 *
 *  The foot is reclaimed to pay for it: unlike the sheet this replaces,
 *  which carried ornaments in all four corners, nothing is drawn along the
 *  bottom, so the text can run closer to it. */
const PAD_LEFT = 0.11;
const PAD_RIGHT = 0.26;
const PAD_TOP = 0.17;
const PAD_BOTTOM = 0.095;

type Block = { key: string; node: React.ReactNode; heading?: boolean };

/**
 * The same lightweight markdown the page used before — H2, H3, ordered
 * lists, paragraphs — but emitting blocks the paginator can measure rather
 * than one flat run of elements.
 */
function toBlocks(content: string): Block[] {
  return content
    .trim()
    .split(/\n\n+/)
    .flatMap((raw, i) => {
      const t = raw.trim();
      const key = `b${i}`;

      // Several headings in this copy carry their body on the very next line
      // rather than after a blank one. Set whole, the sentence would be
      // printed at heading weight; split, the sheet reads as a page again.
      const head = /^(#{2,3})\s+([^\n]*)\n([\s\S]+)$/.exec(t);
      if (head) {
        const [, hashes, line, rest] = head;
        return [
          ...toBlocks(`${hashes} ${line}`).map((b) => ({ ...b, key: `${key}h` })),
          ...toBlocks(rest).map((b, j) => ({ ...b, key: `${key}r${j}` })),
        ];
      }

      if (t.startsWith("## ")) {
        return { key, node: <h2 className="paper-h2">{t.slice(3)}</h2>, heading: true };
      }
      if (t.startsWith("### ")) {
        return { key, node: <h3 className="paper-h3">{t.slice(4)}</h3>, heading: true };
      }
      if (/^\d+\.\s/.test(t)) {
        const items = t.split(/\n/).filter(Boolean);
        return {
          key,
          node: (
            <ol className="paper-ol">
              {items.map((item, j) => (
                <li key={j}>{inline(item.replace(/^\d+\.\s/, ""))}</li>
              ))}
            </ol>
          ),
        };
      }
      if (/^[-*]\s/.test(t)) {
        const items = t.split(/\n/).filter(Boolean);
        return {
          key,
          node: (
            <ul className="paper-ul">
              {items.map((item, j) => (
                <li key={j}>{inline(item.replace(/^[-*]\s/, ""))}</li>
              ))}
            </ul>
          ),
        };
      }
      return { key, node: <p className="paper-p">{inline(t)}</p> };
    });
}

/** **bold** and `code`, which the body copy actually uses. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function PaperReader({
  title,
  standfirst,
  meta,
  content,
}: {
  title: string;
  standfirst: string;
  meta: string;
  content: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const [sheetW, setSheetW] = useState(0);
  const [pages, setPages] = useState<number[][]>([]);
  const [page, setPage] = useState(0);
  /** 'out' while the current sheet lifts, 'in' while the next drops. */
  const [turn, setTurn] = useState<"idle" | "out" | "in">("idle");

  const blocks = React.useMemo(() => toBlocks(content), [content]);

  const sheetH = sheetW * SHEET_RATIO;
  const contentW = sheetW * (1 - PAD_LEFT - PAD_RIGHT);
  const contentH = sheetH * (1 - PAD_TOP - PAD_BOTTOM);

  // Track the sheet's real width so the measuring pass uses the same box the
  // reader will use.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const read = () => setSheetW(el.clientWidth);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure, then pack. Runs whenever the sheet resizes or the article
  // changes, because both move where the page breaks fall.
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el || !contentW || !contentH) return;

    const kids = Array.from(el.children) as HTMLElement[];
    // The masthead only exists on the first sheet, so it is measured as part
    // of that sheet's budget rather than as a block that could be pushed on.
    const head = kids[0];
    const headH = head ? head.getBoundingClientRect().height : 0;
    const blockEls = kids.slice(1);

    const heights = blockEls.map((node) => {
      const style = getComputedStyle(node);
      return (
        node.getBoundingClientRect().height +
        parseFloat(style.marginTop || "0") +
        parseFloat(style.marginBottom || "0")
      );
    });

    const out: number[][] = [];
    let current: number[] = [];
    let used = headH;

    heights.forEach((h, i) => {
      // A block taller than a whole sheet cannot be split by this pass, so it
      // gets a sheet of its own and is allowed to run long rather than being
      // silently clipped.
      if (h > contentH && current.length === 0) {
        out.push([i]);
        used = 0;
        return;
      }

      if (used + h > contentH && current.length) {
        // A heading left alone at the foot of a sheet announces text that is
        // on the next one. Carry any trailing headings over with the block
        // they belong to.
        const carried: number[] = [];
        while (current.length && blocks[current[current.length - 1]]?.heading) {
          carried.unshift(current.pop() as number);
        }
        if (!current.length) {
          // On a narrow screen the masthead can fill the first sheet on its
          // own. Let it stand as a title page rather than stranding a heading
          // under it.
          if (!out.length && headH) {
            out.push([]);
            current = [...carried, i];
            used = carried.reduce((sum, j) => sum + heights[j], 0) + h;
            return;
          }
          // Otherwise a run of headings with nothing under them has to break
          // somewhere, and they stay where they are.
          out.push(carried);
          current = [i];
          used = h;
          return;
        }
        out.push(current);
        current = [...carried, i];
        used = carried.reduce((sum, j) => sum + heights[j], 0) + h;
        return;
      }

      current.push(i);
      used += h;
    });
    if (current.length) out.push(current);

    setPages(out.length ? out : [[]]);
    setPage((p) => Math.min(p, Math.max(0, out.length - 1)));
  }, [blocks, contentW, contentH]);

  const total = pages.length || 1;

  const flipTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= total || turn !== "idle") return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setPage(next);
        return;
      }
      setTurn("out");
      window.setTimeout(() => {
        setPage(next);
        setTurn("in");
        window.setTimeout(() => setTurn("idle"), 320);
      }, 300);
    },
    [total, turn],
  );

  // Arrow keys turn the page while the reader has focus.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      flipTo(page + 1);
    }
    if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      flipTo(page - 1);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [content]);

  const Masthead = (
    <header className="paper-masthead">
      <h1 className="paper-title">{title}</h1>
      <p className="paper-standfirst">{standfirst}</p>
      <p className="paper-meta">{meta}</p>
      <span className="paper-rule" aria-hidden="true" />
    </header>
  );

  const shown = pages[page] ?? [];

  return (
    <div className="paper-stage">
      {/* Hidden sheet used only for measurement. Same width, same type, so
          the numbers it produces are the numbers the reader will hit. */}
      <div
        className="paper-measure paper-ink"
        aria-hidden="true"
        ref={measureRef}
        style={{ width: contentW || undefined }}
      >
        {Masthead}
        {blocks.map((b) => (
          <React.Fragment key={b.key}>{b.node}</React.Fragment>
        ))}
      </div>

      <div className="paper-wrap" ref={wrapRef}>
        <div
          className="paper-sheet"
          data-turn={turn}
          style={{ height: sheetH || undefined }}
          tabIndex={0}
          role="article"
          aria-label={`${title} — sheet ${page + 1} of ${total}`}
          onKeyDown={onKeyDown}
        >
          <span className="paper-spiral" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <span className="paper-ring" key={i} />
            ))}
          </span>

          <div
            className="paper-content paper-ink"
            style={{
              padding: sheetW
                ? `${sheetH * PAD_TOP}px ${sheetW * PAD_RIGHT}px ${sheetH * PAD_BOTTOM}px ${sheetW * PAD_LEFT}px`
                : undefined,
            }}
          >
            {page === 0 && Masthead}
            {shown.map((i) => (
              <React.Fragment key={blocks[i].key}>{blocks[i].node}</React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="paper-controls">
        <button
          type="button"
          className="paper-btn"
          onClick={() => flipTo(page - 1)}
          disabled={page === 0}
          aria-label="Previous sheet"
        >
          ‹ Back
        </button>
        <span className="paper-count">
          Sheet {page + 1} of {total}
        </span>
        <button
          type="button"
          className="paper-btn"
          onClick={() => flipTo(page + 1)}
          disabled={page >= total - 1}
          aria-label="Next sheet"
        >
          Next ›
        </button>
      </div>

      <style>{`
        .paper-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.4rem;
        }

        /* Off-screen rather than display:none — a hidden box still has to be
           laid out for its children to report real heights. */
        .paper-measure {
          position: absolute;
          left: -99999px;
          top: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .paper-wrap {
          width: min(92vw, 760px);
          /* Hinged at the top edge, so the vanishing point belongs there too.
             At 2000px and dead centre the turn read as a faint squash rather
             than a sheet lifting off a binding. */
          perspective: 1500px;
          perspective-origin: 50% 0%;
        }

        /* ---------- the sheet ---------- */
        .paper-sheet {
          position: relative;
          width: 100%;
          border-radius: 4px;
          background-image: url('${sheetUrl}');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-color: #f7f8fa;
          transform-origin: center top;
          transform-style: preserve-3d;
          outline: none;
          box-shadow:
            0 2px 0 rgba(255, 255, 255, 0.6) inset,
            7px 7px 0 -1px #eceef3,
            13px 13px 0 -2px #dfe3ea,
            0 26px 60px -24px rgba(6, 11, 46, 0.65),
            0 0 0 1px rgba(183, 110, 121, 0.25);
          transition: box-shadow 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
          /* The sheet arriving — "the paper becomes big".

             "backwards", not "both": a filling animation outranks every
             declaration, so a forwards fill left transform:none pinned on
             the sheet for good and the page turn below never moved it. */
          animation: paper-open 620ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }
        @keyframes paper-open {
          from { opacity: 0; transform: scale(0.9) translateY(-18px); }
          to   { opacity: 1; transform: none; }
        }

        /* rose gold glow on hover */
        .paper-sheet:hover,
        .paper-sheet:focus-visible {
          box-shadow:
            0 2px 0 rgba(255, 255, 255, 0.75) inset,
            7px 7px 0 -1px #eceef3,
            13px 13px 0 -2px #dfe3ea,
            0 34px 76px -26px rgba(6, 11, 46, 0.7),
            0 0 0 1px rgba(183, 110, 121, 0.7),
            0 0 44px -6px rgba(183, 110, 121, 0.55),
            0 0 110px -20px rgba(232, 180, 184, 0.5);
        }

        /* The flip, hinged on the spiral at the top edge.

           Both halves are keyframe animations rather than a transition on the
           lift. A transition has to observe two different computed values on
           two different style recalcs; React writes the attribute and the
           browser can settle both in one frame, in which case the lift is
           simply skipped and the sheet cuts to the next page. An animation
           starts from its own keyframes and cannot be coalesced away. */
        .paper-sheet[data-turn="out"] {
          animation: paper-lift 300ms cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @keyframes paper-lift {
          from { transform: rotateX(0deg); }
          to   { transform: rotateX(-92deg); }
        }
        .paper-sheet[data-turn="in"] {
          animation: paper-drop 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes paper-drop {
          from { transform: rotateX(78deg); }
          to   { transform: rotateX(0deg); }
        }

        /* The sheets underneath are drawn as hard-edged offset shadows rather
           than as elements. A child cannot be put behind its parent's own
           background — a negative z-index still paints above it — so a real
           element here covered the corner ornaments of the artwork. A shadow
           always paints behind. */

        /* ---------- spiral binding ---------- */
        .paper-spiral {
          position: absolute;
          top: -9px;
          left: 8%;
          right: 8%;
          height: 18px;
          display: flex;
          justify-content: space-between;
          pointer-events: none;
          z-index: 2;
        }
        .paper-ring {
          width: 9px;
          height: 18px;
          border-radius: 9px;
          border: 2px solid #B76E79;
          border-bottom-color: #E8B4B8;
          background: linear-gradient(180deg,
            rgba(251, 233, 231, 0.95) 0%,
            rgba(183, 110, 121, 0.25) 55%,
            rgba(140, 74, 90, 0.1) 100%);
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.35),
            0 0 6px rgba(232, 180, 184, 0.55);
        }

        /* ---------- printed matter ---------- */
        .paper-content {
          position: relative;
          z-index: 1;
          height: 100%;
          overflow: hidden;
        }

        /* The type, shared by the sheet and the hidden sheet it is measured
           on. Every rule below is scoped to .paper-ink and so carries two
           classes: that is what keeps the page-heading rule in index.css
           ("main > section:first-of-type h1", one class and three types) from
           putting Style Script and brand orange onto a masthead printed on
           near-white paper. */
        .paper-ink {
          /* Ink, not the site's orange: this is a near-white sheet. */
          color: #1b2436;
          font-family: 'Sora', system-ui, sans-serif;
          text-align: left;
        }

        .paper-ink .paper-masthead { margin-bottom: 1.1rem; }
        .paper-ink .paper-title {
          margin: 0;
          font-family: 'Cinzel', 'Playfair Display', serif;
          font-size: clamp(1.15rem, 2.6vw, 1.7rem);
          font-weight: 700;
          line-height: 1.22;
          letter-spacing: 0.01em;
          color: #14304d;
        }
        .paper-ink .paper-standfirst {
          margin: 0.6rem 0 0;
          font-size: clamp(0.76rem, 1.35vw, 0.92rem);
          line-height: 1.55;
          color: #46536b;
        }
        .paper-ink .paper-meta {
          margin: 0.55rem 0 0;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7a8598;
        }
        .paper-ink .paper-rule {
          display: block;
          margin-top: 0.85rem;
          height: 2px;
          background: linear-gradient(90deg, #a70066 0%, #d7b460 35%, #5170ff 70%, transparent 100%);
          opacity: 0.85;
        }

        .paper-ink .paper-h2 {
          margin: 1.15rem 0 0;
          font-family: 'Sora', system-ui, sans-serif;
          font-size: clamp(0.92rem, 1.75vw, 1.12rem);
          font-weight: 700;
          line-height: 1.3;
          color: #14304d;
        }
        .paper-ink .paper-h3 {
          margin: 0.95rem 0 0;
          font-size: clamp(0.84rem, 1.5vw, 0.98rem);
          font-weight: 600;
          color: #1f3a5a;
        }
        .paper-ink .paper-p {
          margin: 0.6rem 0 0;
          font-size: clamp(0.74rem, 1.3vw, 0.88rem);
          line-height: 1.62;
          color: #2b3a52;
        }
        .paper-ink .paper-ol,
        .paper-ink .paper-ul {
          margin: 0.6rem 0 0;
          padding-left: 1.15rem;
          font-size: clamp(0.74rem, 1.3vw, 0.88rem);
          line-height: 1.6;
          color: #2b3a52;
        }
        .paper-ink .paper-ol { list-style: decimal; }
        .paper-ink .paper-ul { list-style: disc; }
        .paper-ink .paper-ol li,
        .paper-ink .paper-ul li { margin-top: 0.3rem; }
        .paper-ink strong { font-weight: 700; color: #14304d; }
        .paper-ink code {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 0.92em;
          padding: 0.05em 0.3em;
          border-radius: 3px;
          background: rgba(43, 179, 232, 0.12);
          color: #14506e;
        }

        /* ---------- controls ---------- */
        .paper-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .paper-btn {
          font-family: 'Cinzel', 'Playfair Display', serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.55rem 1.1rem;
          border-radius: 0.7rem;
          color: #FBE9E7;
          background: linear-gradient(180deg,
            rgba(30, 41, 82, 0.92) 0%,
            rgba(15, 23, 42, 0.96) 100%);
          border: 1px solid rgba(232, 180, 184, 0.4);
          box-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.6);
          cursor: pointer;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
        }
        .paper-btn:hover:not(:disabled) {
          border-color: rgba(232, 180, 184, 0.85);
          box-shadow: 0 8px 26px -10px rgba(183, 110, 121, 0.75);
        }
        .paper-btn:disabled { opacity: 0.35; cursor: default; }
        .paper-count {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          color: #E8B4B8;
        }

        @media (prefers-reduced-motion: reduce) {
          .paper-sheet,
          .paper-sheet[data-turn="out"],
          .paper-sheet[data-turn="in"] {
            animation: none !important;
            transition: box-shadow 0.2s ease !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
