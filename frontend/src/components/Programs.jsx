/**
 * frontend/src/components/Programs.jsx
 * The Programs section: a single "forge" bubble that, when clicked, reveals
 * 3 category cards summarizing AI & Tech, Core Engineering, and Non-Engineering.
 *
 * Design mirrors the live site: Space Grotesk headings, Sora body, the electric
 * blue -> fire orange "forge" gradient, and glowing bubble motifs.
 *
 * Constraint compliance:
 *  - Programs are grouped into exactly 3 categories.
 *  - Nothing is listed until the bubble is clicked (3 cards then appear).
 *  - This component is for the Programs page — NOT the homepage. For the
 *    homepage use <ProgramsTeaser/>, which shows only a CTA (no program list).
 */

import { useState, useId } from 'react';
import { PROGRAM_CATEGORIES } from '../data/programs';
import './Programs.css';

export default function Programs() {
  const [revealed, setRevealed] = useState(false);
  const panelId = useId();

  return (
    <section className="fv-programs" aria-labelledby="fv-programs-title">
      <header className="fv-programs__head">
        <p className="fv-programs__eyebrow">PROGRAMS</p>
        <h2 id="fv-programs-title" className="fv-programs__title">
          Pick the forge that <span className="fv-grad">fits your fire.</span>
        </h2>
        <p className="fv-programs__lede">
          Everything we teach lives in three forges. Tap the bubble to reveal them —
          every field ends with a real shipped project.
        </p>
      </header>

      {/* The single program bubble. Collapses once the cards are revealed. */}
      {!revealed && (
        <div className="fv-bubble-stage">
          <button
            type="button"
            className="fv-bubble"
            aria-expanded={revealed}
            aria-controls={panelId}
            onClick={() => setRevealed(true)}
          >
            <span className="fv-bubble__glow" aria-hidden="true" />
            <span className="fv-bubble__label">
              Explore
              <br />
              the forge
            </span>
          </button>
          <p className="fv-bubble__hint">Tap to reveal the 3 tracks</p>
        </div>
      )}

      {/* The 3 category cards, revealed on click. aria-live announces the change. */}
      <div
        id={panelId}
        className={`fv-cards ${revealed ? 'is-revealed' : 'is-hidden'}`}
        aria-live="polite"
      >
        {revealed &&
          PROGRAM_CATEGORIES.map((cat, i) => (
            <article
              key={cat.id}
              className="fv-card"
              style={{
                '--accent': cat.accent,
                animationDelay: `${i * 90}ms`,
              }}
            >
              <div className="fv-card__top">
                <span className="fv-card__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="fv-card__count">{cat.tracks.length} tracks</span>
              </div>

              <h3 className="fv-card__title">{cat.name}</h3>
              <p className="fv-card__tagline">{cat.tagline}</p>

              <ul className="fv-card__list">
                {cat.tracks.map((t) => (
                  <li key={t.title} className="fv-track">
                    <span className="fv-track__title">{t.title}</span>
                    <span className="fv-track__summary">{t.summary}</span>
                    {(t.level || t.length) && (
                      <span className="fv-track__meta">
                        {[t.level, t.length].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
      </div>

      {revealed && (
        <div className="fv-programs__reset">
          <button
            type="button"
            className="fv-textbtn"
            onClick={() => setRevealed(false)}
          >
            ← Collapse the forge
          </button>
        </div>
      )}
    </section>
  );
}
