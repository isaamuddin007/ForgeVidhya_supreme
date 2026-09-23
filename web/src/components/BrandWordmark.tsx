/**
 * BrandWordmark — the company name, centred above every page's heading.
 *
 * The circular mark in the corner carries no words, so the name lives here
 * instead: one band directly under the nav, on every route, never hidden
 * behind a scroll trigger or a media query.
 *
 * The artwork arrives with its own near-white plate (#FCFDFD) baked in, and
 * it stays. "Forge" is set in #2F3B3B — near black — so on the dark theme a
 * transparent version would leave half the name invisible against the glass
 * background. Rounding the corners and lifting it on a shadow is enough to
 * make that plate read as a deliberate badge rather than a stray rectangle,
 * and it leaves every pixel of the file itself untouched.
 */
export function BrandWordmark() {
  return (
    <div className="brand-wordmark-band">
      <img
        src="/wordmark.svg"
        alt="Forge Vidhya — Powered By DeepSeek"
        className="brand-wordmark"
        draggable={false}
        width={1126}
        height={267}
      />

      <style>{`
        .brand-wordmark-band {
          display: flex;
          justify-content: center;
          padding: 0.35rem 1rem 0.75rem;
        }

        .brand-wordmark {
          /* Big, but never wider than the screen it is on. */
          width: clamp(240px, 46vw, 500px);
          height: auto;
          border-radius: 14px;
          box-shadow:
            0 10px 30px -14px rgba(6, 11, 46, 0.55),
            0 0 0 1px rgba(183, 110, 121, 0.35);
          user-select: none;
        }

        @media (min-width: 640px) {
          .brand-wordmark-band { padding-bottom: 1rem; }
        }
      `}</style>
    </div>
  );
}
