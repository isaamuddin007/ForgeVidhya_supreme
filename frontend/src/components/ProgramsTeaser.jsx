/**
 * frontend/src/components/ProgramsTeaser.jsx
 * Homepage-safe entry point to Programs. Renders ONLY a headline + bubble CTA —
 * it deliberately does NOT list any program names, per the requirement that
 * programs are not enumerated on the main homepage. Clicking routes to the
 * Programs page, where the bubble reveals the 3 category cards.
 *
 * Usage on the homepage:
 *   <ProgramsTeaser to="/programs" />
 * `to` accepts a plain href; swap the <a> for a router <Link> if you prefer.
 */

import './Programs.css';

export default function ProgramsTeaser({ to = '/programs' }) {
  return (
    <section className="fv-programs" aria-labelledby="fv-teaser-title">
      <header className="fv-programs__head">
        <p className="fv-programs__eyebrow">PROGRAMS</p>
        <h2 id="fv-teaser-title" className="fv-programs__title">
          Three forges. <span className="fv-grad">One playground.</span>
        </h2>
        <p className="fv-programs__lede">
          AI &amp; Tech, Core Engineering, and the things no syllabus teaches.
          Step into the forge to see what you'll build.
        </p>
      </header>

      <div className="fv-bubble-stage">
        <a className="fv-bubble" href={to} aria-label="Explore the forge — view programs">
          <span className="fv-bubble__glow" aria-hidden="true" />
          <span className="fv-bubble__label">
            Enter
            <br />
            the forge
          </span>
        </a>
        <p className="fv-bubble__hint">See the 3 tracks →</p>
      </div>
    </section>
  );
}
