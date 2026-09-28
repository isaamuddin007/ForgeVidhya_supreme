import React from "react";

/**
 * AuroraBackground — the site's backdrop, taken from the supplied design.
 *
 * Mauve at the top falling to pale blue at the foot, with slow flowing curves
 * across the lower half. Colours sampled from the design itself rather than
 * guessed: the top band reads #cdb9e3 to #e0c5e3, the foot #d5e2ff to #e4e8ff.
 *
 * Everything moves on transform and opacity only. The background it replaces
 * leaned on feTurbulence, which Chrome rasterises on the CPU every frame even
 * where a GPU is available; nothing here does that.
 */

const CSS = `
.aur-root { position: relative; }
.aur-content { position: relative; z-index: 1; }

.aur-stage {
  --aur-mauve:      #cdb9e3;
  --aur-orchid:     #e0c5e3;
  --aur-rose:       #e6c4e6;
  --aur-sky:        #d5e2ff;
  --aur-mist:       #e9eefc;
  --aur-foam:       #eef1fb;

  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
  background:
    radial-gradient(70% 55% at 78% 16%, var(--aur-rose) 0%, transparent 62%),
    radial-gradient(58% 46% at 16% 6%,  var(--aur-mauve) 0%, transparent 58%),
    linear-gradient(180deg,
      var(--aur-mauve) 0%,
      #ddc3e3 26%,
      var(--aur-orchid) 46%,
      var(--aur-mist) 64%,
      var(--aur-sky) 82%,
      var(--aur-foam) 100%);
}

/* slow breathing wash, so the top half is never quite still */
.aur-wash {
  position: absolute; inset: -12%;
  background:
    radial-gradient(38vmax 30vmax at 30% 22%, rgba(232, 196, 230, 0.55), transparent 65%),
    radial-gradient(34vmax 26vmax at 76% 12%, rgba(205, 185, 227, 0.5), transparent 65%);
  animation: aur-drift 26s ease-in-out infinite alternate;
  will-change: transform;
}
@keyframes aur-drift {
  from { transform: translate3d(-2%, -1%, 0) scale(1); }
  to   { transform: translate3d(3%, 2%, 0) scale(1.08); }
}

/* the flowing curves across the foot of the page */
.aur-waves {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 62%;
  width: 100%;
  display: block;
}
.aur-wave { fill: none; stroke-linecap: round; will-change: transform; }
.aur-wave--1 { stroke: rgba(255,255,255,0.85); stroke-width: 1.6; animation: aur-slide-a 30s ease-in-out infinite alternate; }
.aur-wave--2 { stroke: rgba(173,198,255,0.75); stroke-width: 1.3; animation: aur-slide-b 38s ease-in-out infinite alternate; }
.aur-wave--3 { stroke: rgba(255,255,255,0.6);  stroke-width: 1.1; animation: aur-slide-a 46s ease-in-out infinite alternate; }
.aur-wave--4 { stroke: rgba(198,180,226,0.6);  stroke-width: 1.2; animation: aur-slide-b 34s ease-in-out infinite alternate; }
@keyframes aur-slide-a {
  from { transform: translate3d(-3%, 1%, 0); }
  to   { transform: translate3d(2%, -1.5%, 0); }
}
@keyframes aur-slide-b {
  from { transform: translate3d(2%, -1%, 0); }
  to   { transform: translate3d(-3%, 1.5%, 0); }
}

/* the glass: a soft sheen over the whole field */
.aur-gloss {
  position: absolute; inset: 0;
  background: linear-gradient(114deg,
    rgba(255,255,255,0.28) 0%,
    rgba(255,255,255,0.06) 22%,
    transparent 40%,
    transparent 64%,
    rgba(255,255,255,0.14) 82%,
    transparent 100%);
}

/* one slow highlight travelling across, the only fast-ish motion */
.aur-sheen {
  position: absolute;
  top: -20%; bottom: -20%; left: -50%; width: 42%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.4) 50%, transparent);
  transform: skewX(-14deg);
  filter: blur(10px);
  animation: aur-sheen 17s cubic-bezier(.5,0,.3,1) infinite;
}
@keyframes aur-sheen {
  0%        { transform: skewX(-14deg) translateX(-40vw); opacity: 0; }
  10%       { opacity: 1; }
  60%       { transform: skewX(-14deg) translateX(230vw); opacity: 1; }
  61%, 100% { transform: skewX(-14deg) translateX(230vw); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .aur-stage, .aur-stage * { animation: none !important; }
}
`;

type Props = { children?: React.ReactNode; className?: string };

export default function AuroraBackground({ children, className = "" }: Props) {
  return (
    <div className={`aur-root ${className}`.trim()}>
      <style>{CSS}</style>

      <div className="aur-stage" aria-hidden="true">
        <div className="aur-wash" />

        <svg
          className="aur-waves"
          viewBox="0 0 1200 500"
          preserveAspectRatio="none"
        >
          <path className="aur-wave aur-wave--1" d="M-100,250 C180,150 380,330 640,235 C880,150 1030,300 1300,215" />
          <path className="aur-wave aur-wave--2" d="M-100,320 C200,215 420,395 700,300 C920,225 1080,360 1300,285" />
          <path className="aur-wave aur-wave--3" d="M-100,390 C160,300 400,460 660,370 C900,290 1090,420 1300,355" />
          <path className="aur-wave aur-wave--4" d="M-100,180 C220,95 430,265 690,170 C930,85 1100,230 1300,150" />
          <path className="aur-wave aur-wave--2" d="M-100,450 C240,370 450,520 720,435 C950,360 1120,480 1300,420" />
        </svg>

        <div className="aur-gloss" />
        <div className="aur-sheen" />
      </div>

      {children != null && <div className="aur-content">{children}</div>}
    </div>
  );
}
