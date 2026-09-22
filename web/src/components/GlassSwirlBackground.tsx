import React, { useEffect, useId, useState } from "react"; // React 18+

/* Sparkle positions — deterministic (golden-angle spiral), SSR-safe */
const GLINTS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i * 137.508 * Math.PI) / 180;
  const radius = 12 + ((i * 23) % 38);
  return {
    left: `${(50 + radius * Math.cos(angle)).toFixed(1)}%`,
    top: `${(50 + radius * Math.sin(angle)).toFixed(1)}%`,
    size: 3 + ((i * 7) % 4) * 2,
    duration: `${(3.5 + ((i * 13) % 5) * 0.9).toFixed(1)}s`,
    delay: `${((i * 17) % 10) * 0.6}s`,
  };
});

const CSS = `
.gsw-root { position: relative; }
.gsw-content { position: relative; z-index: 1; }

.gsw-stage {
  /* ---- tweak-me palette ---- */
  --gsw-blue: #4d30ff;        /* your royal blue */
  --gsw-blue-light: #9a83ff;  /* light wash */
  --gsw-blue-deep: #2413b8;   /* depth */
  --gsw-rose-light: #f7ddd2;
  --gsw-rose: #e0a48f;
  --gsw-rose-deep: #b76e79;   /* rose gold */

  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
  background: var(--gsw-blue);
}

/* 1 — glass base */
.gsw-base {
  position: absolute; inset: 0;
  background:
    radial-gradient(90vmax 65vmax at 18% 8%, var(--gsw-blue-light), transparent 60%),
    radial-gradient(85vmax 70vmax at 88% 96%, var(--gsw-blue-deep), transparent 62%),
    linear-gradient(155deg, var(--gsw-blue) 0%, var(--gsw-blue-light) 48%, var(--gsw-blue) 100%);
  animation: gsw-base-drift 30s ease-in-out infinite alternate;
}
@keyframes gsw-base-drift {
  from { transform: scale(1) translate(0, 0); }
  to   { transform: scale(1.15) translate(2.5%, -2%); }
}

/* 2 — rose gold swirls */
.gsw-swirl {
  position: absolute;
  border-radius: 50%;
  filter: blur(3vmax);
  mix-blend-mode: screen;
  -webkit-mask: radial-gradient(circle, #000 35%, transparent 68%);
  mask: radial-gradient(circle, #000 35%, transparent 68%);
  will-change: transform;
}
.gsw-swirl--a {
  width: 115vmax; height: 115vmax; top: -40vmax; left: -34vmax;
  background: repeating-conic-gradient(from 30deg,
    transparent 0deg 18deg,
    rgba(183,110,121,.38) 30deg 44deg,
    rgba(247,221,210,.5) 52deg 58deg,
    rgba(224,164,143,.26) 66deg 74deg,
    transparent 86deg 90deg);
  animation: gsw-spin 60s linear infinite;
}
.gsw-swirl--b {
  width: 95vmax; height: 95vmax; right: -32vmax; bottom: -30vmax;
  background: repeating-conic-gradient(from 210deg,
    transparent 0deg 24deg,
    rgba(224,164,143,.4) 40deg 52deg,
    rgba(247,221,210,.5) 60deg 66deg,
    transparent 82deg 90deg);
  animation: gsw-spin-rev 78s linear infinite;
}
.gsw-swirl--c {
  width: 55vmax; height: 55vmax; top: 24%; left: 36%;
  filter: blur(2.2vmax);
  background: repeating-conic-gradient(from 0deg,
    transparent 0deg 30deg,
    rgba(247,221,210,.32) 52deg 62deg,
    rgba(183,110,121,.3) 84deg 96deg,
    transparent 120deg);
  animation: gsw-spin-c 44s linear infinite;
}
@keyframes gsw-spin     { to { transform: rotate(1turn); } }
@keyframes gsw-spin-rev { to { transform: rotate(-1turn); } }
@keyframes gsw-spin-c {
  0%   { transform: rotate(0turn) translate3d(0,0,0) scale(1); }
  50%  { transform: rotate(.5turn) translate3d(4vmax,-3vmax,0) scale(1.2); }
  100% { transform: rotate(1turn) translate3d(0,0,0) scale(1); }
}

/* 3 — rippled refraction (SVG layer) */
.gsw-ripple-svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  opacity: .5;
  mix-blend-mode: screen;
  animation: gsw-ripple-drift 36s ease-in-out infinite alternate;
}
@keyframes gsw-ripple-drift {
  from { transform: translate3d(-1.5%,-1%,0) rotate(0deg) scale(1.03); }
  to   { transform: translate3d(1.5%,1.5%,0) rotate(1.5deg) scale(1.07); }
}

/* 4 — soft light pools (caustics) */
.gsw-caustics {
  position: absolute; inset: 0;
  mix-blend-mode: screen;
  background:
    radial-gradient(30vmax 30vmax at 28% 22%, rgba(255,255,255,.10), transparent 65%),
    radial-gradient(24vmax 24vmax at 74% 68%, rgba(255,228,214,.14), transparent 65%),
    radial-gradient(18vmax 18vmax at 52% 88%, rgba(255,255,255,.07), transparent 65%);
  animation: gsw-caustics 20s ease-in-out infinite alternate;
}
@keyframes gsw-caustics {
  from { transform: translate3d(-3%,-2%,0) scale(1); }
  to   { transform: translate3d(4%,3%,0) scale(1.1); }
}

/* 5 — static diagonal gloss */
.gsw-gloss {
  position: absolute; inset: 0;
  background: linear-gradient(112deg,
    rgba(255,255,255,.10) 0%, rgba(255,255,255,.03) 18%, transparent 34%,
    transparent 62%, rgba(255,255,255,.05) 78%, rgba(255,255,255,.01) 100%);
}

/* 6 — light sweep across the glass */
.gsw-shine {
  position: absolute;
  top: -25%; bottom: -25%; left: -60%; width: 55%;
  background: linear-gradient(100deg,
    transparent 0%, rgba(255,255,255,.02) 20%, rgba(255,255,255,.16) 48%,
    rgba(255,255,255,.28) 52%, rgba(255,255,255,.02) 80%, transparent 100%);
  transform: skewX(-12deg) translateX(-30vw);
  filter: blur(6px);
  mix-blend-mode: screen;
  animation: gsw-sweep 12s cubic-bezier(.5,0,.3,1) infinite;
}
.gsw-shine--thin {
  width: 18%; left: -30%; filter: blur(3px);
  background: linear-gradient(100deg, transparent, rgba(255,240,232,.25) 50%, transparent);
  animation-delay: 1.6s;
}
@keyframes gsw-sweep {
  0%   { transform: skewX(-12deg) translateX(-30vw); opacity: 0; }
  8%   { opacity: 1; }
  55%  { transform: skewX(-12deg) translateX(220vw); opacity: 1; }
  56%, 100% { transform: skewX(-12deg) translateX(220vw); opacity: 0; }
}

/* 7 — twinkling glints */
.gsw-glint {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, rgba(255,235,226,.9) 35%, transparent 70%);
  opacity: 0;
  animation: gsw-glint var(--gsw-dur, 5s) ease-in-out var(--gsw-delay, 0s) infinite;
}
@keyframes gsw-glint {
  0%, 100% { opacity: 0; transform: scale(.3); }
  50%      { opacity: .95; transform: scale(1); }
}

/* 8 — glass grain */
.gsw-grain {
  position: absolute; inset: 0;
  opacity: .08;
  mix-blend-mode: overlay;
}

/* 9 — vignette for depth */
.gsw-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(20,10,90,.35) 100%);
}

@media (prefers-reduced-motion: reduce) {
  .gsw-stage, .gsw-stage * { animation: none !important; }
}
`;

type GlassSwirlBackgroundProps = {
  children?: React.ReactNode;
  className?: string;
};

export default function GlassSwirlBackground({
  children,
  className = "",
}: GlassSwirlBackgroundProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "") || "gsw";
  const rippleFilterId = `gswRipple-${uid}`;
  const rippleGradId = `gswRippleGrad-${uid}`;
  const grainFilterId = `gswGrain-${uid}`;

  /* Stop the SMIL turbulence animation too when reduced motion is on */
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <div className={`gsw-root ${className}`.trim()}>
      <style>{CSS}</style>

      <div className="gsw-stage" aria-hidden="true">
        {/* 1 — royal blue glass base */}
        <div className="gsw-base" />

        {/* 2 — rose gold swirls */}
        <div className="gsw-swirl gsw-swirl--a" />
        <div className="gsw-swirl gsw-swirl--b" />
        <div className="gsw-swirl gsw-swirl--c" />

        {/* 3 — rippled refraction that slowly morphs */}
        <svg className="gsw-ripple-svg">
          <defs>
            <linearGradient id={rippleGradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7ddd2" stopOpacity="0.4" />
              <stop offset="45%" stopColor="#b76e79" stopOpacity="0.32" />
              <stop offset="75%" stopColor="#e0a48f" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f7ddd2" stopOpacity="0.4" />
            </linearGradient>
            <filter id={rippleFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.011 0.017" numOctaves="2" seed="7" result="n">
                {!reduceMotion && (
                  <animate
                    attributeName="baseFrequency"
                    dur="26s"
                    values="0.011 0.017; 0.017 0.011; 0.009 0.021; 0.011 0.017"
                    repeatCount="indefinite"
                  />
                )}
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${rippleGradId})`} filter={`url(#${rippleFilterId})`} />
        </svg>

        {/* 4 — light pools */}
        <div className="gsw-caustics" />

        {/* 5 — static gloss */}
        <div className="gsw-gloss" />

        {/* 6 — moving shine */}
        <div className="gsw-shine" />
        <div className="gsw-shine gsw-shine--thin" />

        {/* 7 — glints */}
        {GLINTS.map((g, i) => (
          <span
            key={i}
            className="gsw-glint"
            style={
              {
                left: g.left,
                top: g.top,
                width: g.size,
                height: g.size,
                "--gsw-dur": g.duration,
                "--gsw-delay": g.delay,
              } as React.CSSProperties
            }
          />
        ))}

        {/* 8 — glass grain */}
        <svg className="gsw-grain">
          <filter id={grainFilterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${grainFilterId})`} />
        </svg>

        {/* 9 — vignette */}
        <div className="gsw-vignette" />
      </div>

      {children != null && <div className="gsw-content">{children}</div>}
    </div>
  );
}
