import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/* ============================================================
   SHARED GRADIENT DEFS
   In the source these lived inside HomeIcon, but all five icons
   reference #goldStroke and #homeFill. That works only while Home
   is rendered first and exactly once — remove it, reorder the
   items or mount a second menu and the other four lose their
   gradients. They are declared once here instead, in a hidden
   SVG, so every icon resolves regardless of order. The stops are
   unchanged, so nothing about how they look moves.
   ============================================================ */
const GradientDefs = () => (
  <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="goldStroke" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBE9E7" />
        <stop offset="45%" stopColor="#E8B4B8" />
        <stop offset="100%" stopColor="#B76E79" />
      </linearGradient>
      <linearGradient id="homeFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B76E79" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#8C4A5A" stopOpacity="0.15" />
      </linearGradient>
    </defs>
  </svg>
);

/* ============================================================
   ORNAMENTAL SVG ICONS — paths exactly as supplied
   ============================================================ */

const HomeIcon = () => (
  <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
    <path
      d="M3.5 13 L14 4 L24.5 13 V23 a2 2 0 0 1-2 2 H5.5 a2 2 0 0 1-2-2 Z"
      fill="url(#homeFill)" stroke="url(#goldStroke)" strokeWidth="2" strokeLinejoin="round"
    />
    <path
      d="M11.5 25 V18 a2.5 2.5 0 0 1 5 0 V25"
      stroke="url(#goldStroke)" strokeWidth="1.4" strokeLinecap="round"
    />
    <circle cx="14" cy="14.5" r="1" fill="#FBE9E7" />
    <path d="M5.5 22.5 L7 21" stroke="url(#goldStroke)" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M22.5 22.5 L21 21" stroke="url(#goldStroke)" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="14" cy="3" r="1" fill="#FBE9E7" opacity="0.9" />
  </svg>
);

const AboutIcon = () => (
  <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
    <circle cx="14" cy="9.5" r="4" fill="url(#homeFill)" stroke="url(#goldStroke)" strokeWidth="1.8" />
    <path
      d="M5.5 24 C5.5 18.5 9.5 16 14 16 C18.5 16 22.5 18.5 22.5 24"
      stroke="url(#goldStroke)" strokeWidth="2" strokeLinecap="round" fill="url(#homeFill)"
    />
    <path d="M11 17 L14 18.5 L17 17" stroke="url(#goldStroke)" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="14" cy="4.5" r="1" fill="#FBE9E7" />
    <circle cx="19.5" cy="9.5" r="0.8" fill="#FBE9E7" opacity="0.8" />
  </svg>
);

const ProgramIcon = () => (
  <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
    <path
      d="M2 11 L14 5 L26 11 L14 17 Z"
      fill="url(#homeFill)" stroke="url(#goldStroke)" strokeWidth="2" strokeLinejoin="round"
    />
    <path
      d="M7 13 V19 C7 19 9 21.5 14 21.5 C19 21.5 21 19 21 19 V13"
      stroke="url(#goldStroke)" strokeWidth="1.6" strokeLinecap="round"
    />
    <path d="M21 19 L21 23.5" stroke="url(#goldStroke)" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="21" cy="24.5" r="1.2" fill="#FBE9E7" />
    <circle cx="14" cy="11" r="1" fill="#FBE9E7" />
    <path d="M4 10 L6 9" stroke="url(#goldStroke)" strokeWidth="1" strokeLinecap="round" />
    <path d="M24 10 L22 9" stroke="url(#goldStroke)" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const BlogsIcon = () => (
  <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
    <rect x="5" y="4" width="15" height="20" rx="2"
      fill="url(#homeFill)" stroke="url(#goldStroke)" strokeWidth="1.6" />
    <rect x="9" y="7" width="15" height="18" rx="2"
      fill="#0f172a" fillOpacity="0.85" stroke="url(#goldStroke)" strokeWidth="2" />
    <path d="M12 12 H21" stroke="url(#goldStroke)" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M12 15.5 H19" stroke="url(#goldStroke)" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M12 19 H20" stroke="url(#goldStroke)" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M19 7 V10.5 L20.5 9.5 L22 10.5 V7"
      fill="#FBE9E7" fillOpacity="0.9" stroke="url(#goldStroke)" strokeWidth="0.9" />
    <circle cx="6.5" cy="6.5" r="0.7" fill="#FBE9E7" />
  </svg>
);

const ContactIcon = () => (
  <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
    <rect x="3" y="7" width="22" height="15" rx="2.5"
      fill="url(#homeFill)" stroke="url(#goldStroke)" strokeWidth="2" />
    <path d="M4 8.5 L14 16 L24 8.5"
      stroke="url(#goldStroke)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="14" cy="17.5" r="2.2" fill="#B76E79" fillOpacity="0.5"
      stroke="url(#goldStroke)" strokeWidth="1.1" />
    <circle cx="14" cy="17.5" r="0.7" fill="#FBE9E7" />
    <path d="M5.5 20.5 L8 18" stroke="url(#goldStroke)" strokeWidth="0.9" strokeLinecap="round" />
    <path d="M22.5 20.5 L20 18" stroke="url(#goldStroke)" strokeWidth="0.9" strokeLinecap="round" />
  </svg>
);

/* ============================================================
   NAV ITEMS
   The source used hash anchors (#home, #about). This site is a
   router app, so each item carries its real route and navigation
   goes through the host's handler, which keeps the click sound
   and the Programs chooser behaving as they did.
   ============================================================ */
type NavItem = { label: string; Icon: () => React.JSX.Element; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", Icon: HomeIcon, href: "/" },
  { label: "About", Icon: AboutIcon, href: "/about" },
  { label: "Programs", Icon: ProgramIcon, href: "/services" },
  { label: "Blogs", Icon: BlogsIcon, href: "/blog" },
  { label: "Contact", Icon: ContactIcon, href: "/contact" },
];

export default function RoyalNavMenu({
  onNavigate,
}: {
  /** Host handles the actual navigation (sound, Programs chooser, routing). */
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const close = useCallback(() => setOpen(false), []);

  // Escape closes, and focus goes back to the trigger — without that the
  // keyboard lands back at the top of the document.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    // pointerdown rather than click: a click that starts inside the panel and
    // ends outside it should not count as clicking away.
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  // A route change means the menu did its job.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <GradientDefs />

      <button
        ref={triggerRef}
        type="button"
        className={`rnm-trigger ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-controls="royal-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="rnm-trigger-glow" aria-hidden="true" />
        <span className="rnm-bars" aria-hidden="true">
          <span className="rnm-bar rnm-bar-1" />
          <span className="rnm-bar rnm-bar-2" />
          <span className="rnm-bar rnm-bar-3" />
        </span>
      </button>

      <div
        className="rnm-backdrop"
        data-open={open}
        aria-hidden="true"
        onPointerDown={close}
      />

      <nav
        id="royal-nav-panel"
        ref={panelRef}
        className="rnm-panel"
        data-open={open}
        aria-label="Primary"
        // Out of the tab order while closed, so a keyboard user does not
        // tab through five invisible links.
        inert={!open}
      >
        <span className="rnm-chevron" aria-hidden="true" />
        <div className="rnm-rail rnm-rail-top" aria-hidden="true" />

        <div className="rnm-inner">
          {NAV_ITEMS.map(({ label, Icon, href }, i) => (
            <a
              key={label}
              href={href}
              className={`rnm-item ${isActive(href) ? "is-active" : ""}`}
              style={{ "--i": i } as React.CSSProperties}
              aria-current={isActive(href) ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                close();
                onNavigate(href);
              }}
            >
              <span className="rnm-item-frame" aria-hidden="true" />
              <span className="rnm-corner nc-tl" aria-hidden="true" />
              <span className="rnm-corner nc-tr" aria-hidden="true" />
              <span className="rnm-corner nc-bl" aria-hidden="true" />
              <span className="rnm-corner nc-br" aria-hidden="true" />
              <span className="rnm-item-glow" aria-hidden="true" />
              <span className="rnm-item-icon"><Icon /></span>
              <span className="rnm-item-label">{label}</span>
              <span className="rnm-item-shine" aria-hidden="true" />
            </a>
          ))}
        </div>

        <div className="rnm-rail rnm-rail-bottom" aria-hidden="true" />
      </nav>

      <style>{`
        /* ============ TRIGGER ============ */
        .rnm-trigger {
          position: relative;
          /* above .rnm-backdrop (80) and .rnm-panel (90): the trigger has to
             stay sharp and clickable while the menu is open, otherwise the
             backdrop swallows the click that should close it */
          z-index: 95;
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 14px 14px 18px 18px / 14px 14px 22px 22px; /* shield */
          background:
            linear-gradient(180deg,
              rgba(30, 41, 82, 0.92) 0%,
              rgba(15, 23, 42, 0.96) 100%);
          border: 1px solid rgba(232, 180, 184, 0.35);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.1) inset,
            0 -1px 0 rgba(0, 0, 0, 0.5) inset,
            0 6px 18px rgba(0, 0, 0, 0.45);
          cursor: pointer;
          isolation: isolate;
          transition: border-color 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .rnm-trigger:hover { border-color: rgba(232, 180, 184, 0.7); }
        .rnm-trigger:focus-visible {
          outline: 2px solid #FBE9E7;
          outline-offset: 3px;
        }

        .rnm-trigger-glow {
          position: absolute;
          inset: -8px;
          border-radius: inherit;
          background: radial-gradient(ellipse at center,
            rgba(232, 180, 184, 0.45) 0%,
            rgba(183, 110, 121, 0.2) 50%,
            transparent 78%);
          filter: blur(8px);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease;
        }
        .rnm-trigger:hover .rnm-trigger-glow,
        .rnm-trigger.is-open .rnm-trigger-glow { opacity: 1; }

        .rnm-bars {
          position: relative;
          display: block;
          width: 22px;
          height: 16px;
        }
        .rnm-bar {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          border-radius: 2px;
          background: #E8B4B8;
          box-shadow: 0 0 6px rgba(232, 180, 184, 0.55);
          /* Rotation happens about the bar's own centre, so the two outer
             bars meet in the middle rather than swinging off-axis. */
          transform-origin: 50% 50%;
          transition:
            transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 180ms ease;
        }
        .rnm-bar-1 { top: 0; }
        .rnm-bar-2 { top: 7px; }
        .rnm-bar-3 { top: 14px; }

        /* hover: the lines drift apart */
        .rnm-trigger:hover .rnm-bar-1 { transform: translateY(-2px); }
        .rnm-trigger:hover .rnm-bar-3 { transform: translateY(2px); }

        /* open: outer bars slide to the centre line and cross, middle fades */
        .rnm-trigger.is-open .rnm-bar-1 { transform: translateY(7px) rotate(45deg); }
        .rnm-trigger.is-open .rnm-bar-2 { opacity: 0; transform: scaleX(0.3); }
        .rnm-trigger.is-open .rnm-bar-3 { transform: translateY(-7px) rotate(-45deg); }

        /* ============ BACKDROP ============ */
        .rnm-backdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(6, 11, 46, 0.4);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          opacity: 0;
          visibility: hidden;
          transition: opacity 300ms ease, visibility 0s linear 300ms;
        }
        .rnm-backdrop[data-open="true"] {
          opacity: 1;
          visibility: visible;
          transition: opacity 400ms ease, visibility 0s;
        }

        /* ============ PANEL ============ */
        .rnm-panel {
          position: fixed;
          top: 0.75rem;
          left: 50%;
          z-index: 90;
          width: min(90vw, 900px);
          padding: 0.85rem;
          border-radius: 1.5rem;
          background:
            linear-gradient(180deg,
              rgba(30, 41, 82, 0.92) 0%,
              rgba(15, 23, 42, 0.96) 50%,
              rgba(10, 15, 35, 0.98) 100%);
          border: 1px solid rgba(232, 180, 184, 0.28);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.08) inset,
            0 -1px 0 rgba(0, 0, 0, 0.6) inset,
            0 20px 60px rgba(0, 0, 0, 0.55),
            0 0 80px rgba(0, 242, 254, 0.08),
            0 0 120px rgba(183, 110, 121, 0.1);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);

          /* The -50% keeps it centred; the -110% is the slide. Both live in
             one transform, so neither can cancel the other out. */
          transform: translate(-50%, -110%);
          opacity: 0;
          visibility: hidden;
          transition:
            transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 200ms ease,
            visibility 0s linear 300ms;
        }
        .rnm-panel[data-open="true"] {
          transform: translate(-50%, 0);
          opacity: 1;
          visibility: visible;
          transition:
            transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 250ms ease,
            visibility 0s;
        }

        /* Ornamental chevron at the top centre */
        .rnm-chevron {
          position: absolute;
          top: -1px;
          left: 50%;
          width: 26px;
          height: 13px;
          transform: translateX(-50%);
          pointer-events: none;
          background: linear-gradient(180deg,
            rgba(251, 233, 231, 0.95) 0%,
            rgba(232, 180, 184, 0.8) 45%,
            rgba(183, 110, 121, 0.5) 100%);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          filter: drop-shadow(0 2px 5px rgba(183, 110, 121, 0.7));
        }

        /* ============ RAILS ============ */
        .rnm-rail {
          position: relative;
          height: 3px;
          margin: 0 1.2rem;
          background:
            linear-gradient(90deg,
              transparent 0%,
              rgba(232, 180, 184, 0.35) 15%,
              rgba(251, 233, 231, 0.9) 50%,
              rgba(232, 180, 184, 0.35) 85%,
              transparent 100%);
          filter: drop-shadow(0 0 6px rgba(232, 180, 184, 0.6));
        }
        .rnm-rail::before,
        .rnm-rail::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transform: translateY(-50%) rotate(45deg);
          background: radial-gradient(circle, #FBE9E7 0%, #B76E79 60%, transparent 90%);
          box-shadow: 0 0 8px rgba(251, 233, 231, 0.8);
        }
        .rnm-rail::before { left: -8px; }
        .rnm-rail::after  { right: -8px; }
        .rnm-rail-top    { margin-bottom: 0.85rem; }
        .rnm-rail-bottom { margin-top: 0.85rem; }

        /* light sweep across the top rail as the panel opens */
        .rnm-rail-top {
          overflow: hidden;
          background-image:
            linear-gradient(90deg,
              transparent 0%,
              rgba(232, 180, 184, 0.35) 15%,
              rgba(251, 233, 231, 0.9) 50%,
              rgba(232, 180, 184, 0.35) 85%,
              transparent 100%),
            linear-gradient(90deg,
              transparent 35%,
              rgba(255, 255, 255, 0.95) 50%,
              transparent 65%);
          background-repeat: no-repeat;
          background-size: 100% 100%, 45% 100%;
          background-position: 0 0, -60% 0;
        }
        .rnm-panel[data-open="true"] .rnm-rail-top {
          animation: rnm-rail-sweep 700ms ease-out;
        }
        @keyframes rnm-rail-sweep {
          from { background-position: 0 0, -60% 0; }
          to   { background-position: 0 0, 160% 0; }
        }

        /* ============ ITEM LAYOUT ============ */
        .rnm-inner {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.6rem;
          padding: 0 0.2rem;
        }

        /* ============ NAV ITEM ============ */
        .rnm-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          padding: 1.15rem 0.75rem;
          border-radius: 0.9rem;
          text-decoration: none;
          color: rgba(230, 241, 255, 0.7);
          font-family: 'Cinzel', 'Playfair Display', serif;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-align: center;
          isolation: isolate;
          overflow: hidden;

          /* start state for the stagger */
          opacity: 0;
          transform: translateY(-8px);
        }
        .rnm-panel[data-open="true"] .rnm-item {
          opacity: 1;
          transform: translateY(0);
          transition:
            opacity 320ms ease calc(var(--i) * 60ms),
            transform 320ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--i) * 60ms),
            color 0.4s ease;
        }
        .rnm-item:focus-visible {
          outline: 2px solid #FBE9E7;
          outline-offset: 2px;
        }

        .rnm-item-frame {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            linear-gradient(180deg,
              rgba(42, 55, 100, 0.55) 0%,
              rgba(20, 28, 60, 0.65) 100%);
          border: 1px solid rgba(140, 200, 255, 0.12);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.06) inset,
            0 -1px 0 rgba(0, 0, 0, 0.4) inset;
          z-index: -1;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }

        .rnm-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          pointer-events: none;
          opacity: 0.35;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .nc-tl { top: 5px;    left: 5px;    border-top: 1px solid #E8B4B8; border-left: 1px solid #E8B4B8; }
        .nc-tr { top: 5px;    right: 5px;   border-top: 1px solid #E8B4B8; border-right: 1px solid #E8B4B8; }
        .nc-bl { bottom: 5px; left: 5px;    border-bottom: 1px solid #E8B4B8; border-left: 1px solid #E8B4B8; }
        .nc-br { bottom: 5px; right: 5px;   border-bottom: 1px solid #E8B4B8; border-right: 1px solid #E8B4B8; }

        .rnm-item-glow {
          position: absolute;
          inset: -6px;
          border-radius: inherit;
          background: radial-gradient(ellipse at center,
            rgba(232, 180, 184, 0.35) 0%,
            rgba(183, 110, 121, 0.15) 45%,
            transparent 75%);
          opacity: 0;
          z-index: -2;
          transition: opacity 0.4s ease;
          filter: blur(8px);
        }

        .rnm-item-icon {
          display: inline-flex;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .rnm-item-shine {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(115deg,
            transparent 30%,
            rgba(255, 255, 255, 0.14) 50%,
            transparent 70%);
          background-size: 250% 100%;
          background-position: 200% center;
          pointer-events: none;
          opacity: 0;
        }

        /* ============ HOVER ============ */
        .rnm-item:hover { color: #FBE9E7; }
        .rnm-item:hover .rnm-item-frame {
          border-color: rgba(232, 180, 184, 0.4);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.1) inset,
            0 -1px 0 rgba(0, 0, 0, 0.4) inset,
            0 8px 24px rgba(183, 110, 121, 0.25);
        }
        .rnm-item:hover .rnm-item-glow { opacity: 1; }
        .rnm-item:hover .rnm-corner { opacity: 0.9; transform: scale(1.15); }
        .rnm-item:hover .rnm-item-icon { transform: rotate(-8deg) scale(1.15); }
        .rnm-item:hover .rnm-item-shine {
          opacity: 1;
          animation: rnm-shine 0.9s ease-out;
        }
        @keyframes rnm-shine {
          from { background-position: 200% center; }
          to   { background-position: -50% center; }
        }

        /* ============ ACTIVE (jewel) ============ */
        .rnm-item.is-active { color: #FFF7F0; }
        .rnm-item.is-active .rnm-item-frame {
          background:
            linear-gradient(180deg,
              rgba(232, 180, 184, 0.22) 0%,
              rgba(183, 110, 121, 0.12) 45%,
              rgba(15, 23, 42, 0.9) 100%);
          border-color: transparent;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.15) inset,
            0 0 0 1.5px rgba(251, 233, 231, 0.55),
            0 0 0 3px rgba(183, 110, 121, 0.35),
            0 8px 30px rgba(183, 110, 121, 0.5),
            0 0 60px rgba(232, 180, 184, 0.35);
        }
        .rnm-item.is-active .rnm-item-glow {
          opacity: 1;
          background: radial-gradient(ellipse at center,
            rgba(244, 194, 194, 0.5) 0%,
            rgba(183, 110, 121, 0.25) 50%,
            transparent 80%);
        }
        .rnm-item.is-active .rnm-corner {
          opacity: 1;
          border-color: #FBE9E7;
          filter: drop-shadow(0 0 4px #FBE9E7);
        }
        .rnm-item.is-active .rnm-item-icon {
          filter: drop-shadow(0 0 6px rgba(251, 233, 231, 0.6));
        }
        .rnm-item.is-active .rnm-item-shine {
          opacity: 1;
          animation: rnm-shine-loop 4s ease-in-out infinite;
        }
        @keyframes rnm-shine-loop {
          0%, 55% { background-position: 200% center; }
          100%    { background-position: -50% center; }
        }
        .rnm-item.is-active::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 2px;
          width: 65%;
          height: 8px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(232, 180, 184, 0.55), transparent 70%);
          filter: blur(4px);
          pointer-events: none;
        }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 767px) {
          .rnm-panel {
            width: 95vw;
            padding: 0.6rem;
          }
          .rnm-inner {
            grid-template-columns: 1fr;
            gap: 0.4rem;
          }
          .rnm-item {
            flex-direction: row;
            justify-content: flex-start;
            gap: 0.85rem;
            padding: 0.8rem 1rem;
            text-align: left;
          }
          .rnm-rail-top    { margin-bottom: 0.6rem; }
          .rnm-rail-bottom { margin-top: 0.6rem; }
        }

        /* ============ REDUCED MOTION ============ */
        @media (prefers-reduced-motion: reduce) {
          .rnm-panel,
          .rnm-panel[data-open="true"],
          .rnm-backdrop,
          .rnm-backdrop[data-open="true"],
          .rnm-bar,
          .rnm-item,
          .rnm-panel[data-open="true"] .rnm-item,
          .rnm-item-icon,
          .rnm-trigger {
            transition-duration: 0.01ms !important;
            transition-delay: 0s !important;
          }
          .rnm-panel[data-open="true"] .rnm-rail-top,
          .rnm-item:hover .rnm-item-shine,
          .rnm-item.is-active .rnm-item-shine {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
