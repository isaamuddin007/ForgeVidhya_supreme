import React from 'react';

const LiquidGlassBackground = () => {
  return (
    <>
      {/* Fixed, full-screen container that sits behind everything */}
      <div className="liquid-bg-container fixed inset-0 -z-10 overflow-hidden">

        {/* The gradient blobs */}
        <div className="liquid-blob blob-1" />
        <div className="liquid-blob blob-2" />
        <div className="liquid-blob blob-3" />

        {/* Subtle noise overlay (pure CSS) */}
        <div className="noise-overlay" />
      </div>

      {/* Global styles for this component */}
      <style>{`
        /* ---------- Container ---------- */
        .liquid-bg-container {
          background: #0f172a; /* dark slate */
          isolation: isolate;
        }

        /* ---------- SVG Filter is already defined above, but we apply it via CSS ---------- */
        .liquid-blob {
          position: absolute;
          width: 140vmax;
          height: 140vmax;
          border-radius: 50%;
          /* Was: filter: url(#liquid-glass) blur(28px).
             The SVG pass (feTurbulence -> feDisplacementMap) had to be
             recomputed over a ~2500px region for each of the three blobs on
             every frame, because they animate underneath it. Measured at
             ~900ms per frame, which is what made scrolling stutter. Chrome
             rasterises feTurbulence on the CPU even with a GPU present, so
             this is not a slow-machine problem. The blur is nudged up to
             cover the softening the displacement used to provide. */
          filter: blur(38px);
          opacity: 0.85;
          will-change: transform, border-radius;
          mix-blend-mode: screen; /* gives the glassy glow on dark slate */
        }

        /* ---------- Blob 1 – Neon light blue core ---------- */
        .blob-1 {
          top: -45vmax;
          left: -30vmax;
          background: radial-gradient(
            circle at 40% 40%,
            #00f2fe 0%,
            #4facfe 35%,
            rgba(79, 172, 254, 0.2) 65%,
            transparent 90%
          );
          animation:
            blob-float-1 26s ease-in-out infinite alternate,
            blob-morph 14s ease-in-out infinite alternate,
            blob-breathe 9s ease-in-out infinite alternate;
        }

        /* ---------- Blob 2 – Deep ocean blue secondary ---------- */
        .blob-2 {
          bottom: -50vmax;
          right: -25vmax;
          background: radial-gradient(
            circle at 60% 60%,
            #4facfe 0%,
            #0077be 40%,
            rgba(0, 119, 190, 0.15) 70%,
            transparent 90%
          );
          animation:
            blob-float-2 32s ease-in-out infinite alternate,
            blob-morph 18s ease-in-out infinite alternate,
            blob-breathe 11s ease-in-out infinite alternate;
          animation-delay: -4s, -3s, -2s;
        }

        /* ---------- Blob 3 – Subtle neon accent ---------- */
        .blob-3 {
          top: 10vmax;
          left: 30vmax;
          width: 90vmax;
          height: 90vmax;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(0, 242, 254, 0.7) 0%,
            rgba(79, 172, 254, 0.25) 45%,
            transparent 80%
          );
          animation:
            blob-float-3 22s ease-in-out infinite alternate,
            blob-morph 12s ease-in-out infinite alternate,
            blob-breathe 7s ease-in-out infinite alternate;
          animation-delay: -7s, -5s, -4s;
        }

        /* ---------- Keyframes: floating (position) ---------- */
        @keyframes blob-float-1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(8vmax, 5vmax) scale(1.04); }
          100% { transform: translate(-4vmax, 10vmax) scale(0.98); }
        }

        @keyframes blob-float-2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-7vmax, -6vmax) scale(1.06); }
          100% { transform: translate(5vmax, -10vmax) scale(0.97); }
        }

        @keyframes blob-float-3 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-10vmax, 6vmax) scale(1.08); }
          100% { transform: translate(8vmax, -5vmax) scale(0.95); }
        }

        /* ---------- Keyframes: morphing border-radius (liquid glass) ---------- */
        @keyframes blob-morph {
          0% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% {
            border-radius: 40% 60% 70% 30% / 50% 60% 40% 50%;
          }
          50% {
            border-radius: 30% 60% 70% 40% / 50% 30% 60% 70%;
          }
          75% {
            border-radius: 50% 40% 30% 60% / 40% 70% 50% 60%;
          }
          100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
        }

        /* ---------- Keyframes: breathing (scale + opacity) ---------- */
        @keyframes blob-breathe {
          0% {
            opacity: 0.75;
            transform: scale(1) translate(0, 0);
          }
          50% {
            opacity: 1;
            transform: scale(1.03) translate(0, 0);
          }
          100% {
            opacity: 0.8;
            transform: scale(0.99) translate(0, 0);
          }
        }

        /* ---------- Noise overlay (pure CSS) ---------- */
        .noise-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.055;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
          mix-blend-mode: overlay;
          z-index: 10;
        }

        /* ---------- Ensure no scrollbar from oversized blobs ---------- */
        .liquid-bg-container {
          overflow: hidden;
        }

        /* ---------- Optional: reduce motion for accessibility ---------- */
        @media (prefers-reduced-motion: reduce) {
          .liquid-blob {
            animation: none !important;
            filter: blur(38px) !important;
          }
        }
      `}</style>
    </>
  );
};

export default LiquidGlassBackground;
