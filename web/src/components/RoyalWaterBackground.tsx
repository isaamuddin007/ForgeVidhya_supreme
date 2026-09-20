import React from 'react';

const RoyalWaterBackground = () => {
  return (
    <>
      <div className="royal-water-bg fixed inset-0 -z-10 overflow-hidden">
        {/*
          The two feTurbulence + feDisplacementMap filters that used to sit
          here have been removed. Measured on this page, with everything else
          identical:

            as written (animated turbulence)      250ms per frame
            SMIL <animate> tags removed           250ms  — no change at all
            static turbulence, 1 octave           183ms
            only the front wave filtered          100ms
            no turbulence                          67ms
            no background at all                   17ms

          Removing the <animate> tags does nothing, because the waves are
          transform-animated: the filter input changes every frame either
          way, so the turbulence is re-rasterised every frame regardless.
          Chrome rasterises feTurbulence on the CPU even where a GPU is
          available, so this is not a low-end-device problem.

          To put them back, restore the <filter> defs and the filter="..."
          attributes on the three wave paths.
        */}

        {/* Layer 1: Deep navy base gradient */}
        <div className="water-base" />

        {/* Layer 2: Royal blue wave sheets (SVG paths) */}
        <svg
          className="water-waves"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Royal blue gradients */}
            <linearGradient id="royal-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>

            <linearGradient id="royal-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0c1e5c" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <linearGradient id="royal-3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4169E1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.6" />
            </linearGradient>

            <radialGradient id="water-glow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#1e40af" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0a0f2c" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Wave layer 1 — back, slowest, softest */}
          <path
            className="wave wave-1"
            fill="url(#royal-1)"
            opacity="0.55"
            d="M0,450 C240,380 480,520 720,450 C960,380 1200,520 1440,450 L1440,900 L0,900 Z"
          />

          {/* Wave layer 2 — mid, royal blue */}
          <path
            className="wave wave-2"
            fill="url(#royal-2)"
            opacity="0.7"
            d="M0,550 C300,470 600,630 900,540 C1140,470 1300,600 1440,530 L1440,900 L0,900 Z"
          />

          {/* Wave layer 3 — front, deepest royal blue */}
          <path
            className="wave wave-3"
            fill="url(#royal-3)"
            opacity="0.85"
            d="M0,680 C260,610 520,740 780,670 C1040,600 1260,720 1440,660 L1440,900 L0,900 Z"
          />

          {/* Highlight crest on top of front wave */}
          <path
            className="wave wave-crest"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2"
            strokeOpacity="0.5"
            d="M0,680 C260,610 520,740 780,670 C1040,600 1260,720 1440,660"
          />
        </svg>

        {/* Layer 3: Soft radial glow in the center */}
        <div className="water-glow" />

        {/* Layer 4: Floating light caustics */}
        <div className="caustics caustics-1" />
        <div className="caustics caustics-2" />

        {/* Layer 5: Subtle noise texture overlay */}
        <div className="water-noise" />

        {/* Layer 6: Top vignette for depth */}
        <div className="water-vignette" />
      </div>

      <style>{`
        /* ---------- Base container ---------- */
        .royal-water-bg {
          background: #060b2e; /* very deep navy */
        }

        /* ---------- Deep navy base gradient ---------- */
        .water-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            #060b2e 0%,
            #0a1445 30%,
            #0f1d5e 60%,
            #0a1445 100%
          );
        }

        /* ---------- SVG wave sheets ---------- */
        .water-waves {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .wave {
          transform-origin: center bottom;
          will-change: transform;
        }

        .wave-1 {
          animation: wave-drift-1 18s ease-in-out infinite alternate;
        }

        .wave-2 {
          animation: wave-drift-2 14s ease-in-out infinite alternate;
        }

        .wave-3 {
          animation: wave-drift-3 11s ease-in-out infinite alternate;
        }

        .wave-crest {
          animation: wave-drift-3 11s ease-in-out infinite alternate,
                     crest-shimmer 5s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(147, 197, 253, 0.5));
        }

        /* ---------- Wave motion keyframes ---------- */
        @keyframes wave-drift-1 {
          0%   { transform: translateX(-3%) translateY(8px) scaleY(1); }
          50%  { transform: translateX(2%) translateY(-4px) scaleY(1.06); }
          100% { transform: translateX(-2%) translateY(6px) scaleY(1.02); }
        }

        @keyframes wave-drift-2 {
          0%   { transform: translateX(4%) translateY(-6px) scaleY(1); }
          50%  { transform: translateX(-3%) translateY(10px) scaleY(1.08); }
          100% { transform: translateX(2%) translateY(-4px) scaleY(0.98); }
        }

        @keyframes wave-drift-3 {
          0%   { transform: translateX(-2%) translateY(4px) scaleY(1.02); }
          50%  { transform: translateX(3%) translateY(-8px) scaleY(1.1); }
          100% { transform: translateX(-4%) translateY(6px) scaleY(1); }
        }

        @keyframes crest-shimmer {
          0%, 100% { stroke-opacity: 0.35; }
          50%      { stroke-opacity: 0.75; }
        }

        /* ---------- Radial water glow ---------- */
        .water-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 80% 60% at 50% 45%,
            rgba(96, 165, 250, 0.18) 0%,
            rgba(37, 99, 235, 0.08) 40%,
            transparent 75%
          );
          mix-blend-mode: screen;
          pointer-events: none;
          animation: glow-breathe 8s ease-in-out infinite;
        }

        @keyframes glow-breathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.05); }
        }

        /* ---------- Floating caustics (light patterns) ---------- */
        .caustics {
          position: absolute;
          width: 80vmax;
          height: 80vmax;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.4;
        }

        .caustics-1 {
          top: -20vmax;
          left: -10vmax;
          background: radial-gradient(
            circle,
            rgba(65, 105, 225, 0.5) 0%,
            rgba(30, 64, 175, 0.2) 40%,
            transparent 70%
          );
          animation: caustic-float-1 22s ease-in-out infinite alternate;
        }

        .caustics-2 {
          bottom: -25vmax;
          right: -15vmax;
          background: radial-gradient(
            circle,
            rgba(96, 165, 250, 0.4) 0%,
            rgba(37, 99, 235, 0.15) 45%,
            transparent 70%
          );
          animation: caustic-float-2 26s ease-in-out infinite alternate;
        }

        @keyframes caustic-float-1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(6vmax, 4vmax) scale(1.08); }
          100% { transform: translate(-3vmax, 8vmax) scale(0.96); }
        }

        @keyframes caustic-float-2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-5vmax, -6vmax) scale(1.1); }
          100% { transform: translate(4vmax, -3vmax) scale(0.94); }
        }

        /* ---------- Premium noise texture ---------- */
        .water-noise {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
          mix-blend-mode: overlay;
        }

        /* ---------- Top vignette ---------- */
        .water-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(6, 11, 46, 0.6) 0%, transparent 25%),
            linear-gradient(0deg, rgba(6, 11, 46, 0.8) 0%, transparent 30%);
        }

        /* ---------- Reduced motion ---------- */
        @media (prefers-reduced-motion: reduce) {
          .wave,
          .wave-crest,
          .water-glow,
          .caustics,
          .caustics-1,
          .caustics-2 {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default RoyalWaterBackground;
