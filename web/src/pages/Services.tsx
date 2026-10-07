import type { CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { CourseView } from "@/components/CourseView";
import { Icon } from "@/components/ui/primitives";
import { programCategories } from "@/lib/site";
import { getCourse } from "@/lib/courses";
import wordmarkUrl from "@/assets/logo-wordmark.png";

/**
 * Programs — built to the supplied design.
 *
 * The landing is three lines of type on the animated glass, staggered left and
 * right, with no cards at all. Each blue gradient title is the link into that
 * category; the courses inside it are then shown as rose gold cards.
 *
 * Nothing lifts on hover. The titles drift gently side to side on their own,
 * each on its own timing so the three never move in step.
 */

type Track = { id: string; title: string; caption: string; offset: string };

/** Worded as the design words them, keyed to the category ids already in use
 *  so every link still lands exactly where it did before. */
const TRACKS: Track[] = [
  {
    id: "ai-and-tech",
    title: "AI and technology",
    caption: "Learn what technology can do in the present era",
    offset: "3%",
  },
  {
    id: "core-engineering",
    title: "Core engineering study",
    caption: "Learn to build the infrastructure that runs the world practically",
    offset: "34%",
  },
  {
    id: "non-tech",
    title: "Non tech and the real world",
    caption: "Lead in real life by the soft skills the world demands",
    offset: "4%",
  },
];

export default function Services() {
  const [params] = useSearchParams();
  const categoryId = params.get("category");
  const courseSlug = params.get("course");
  const category = programCategories.find((c) => c.id === categoryId);
  const course = getCourse(courseSlug);

  // ---- Course knowledge base (unchanged) ----------------------------------
  if (course) {
    const backHref = category ? `/services?category=${category.id}` : "/services";
    const backLabel = category ? `${category.title} programs` : "All programs";
    return (
      <Layout>
        <SEO
          title={`${course.title} — Knowledge base`}
          description={course.tagline}
        />
        <CourseView course={course} backHref={backHref} backLabel={backLabel} />
      </Layout>
    );
  }

  // ---- One category: its courses, as rose gold cards -----------------------
  if (category) {
    return (
      <Layout>
        <SEO
          title={`${category.title} Programs`}
          description={category.blurb}
        />
        <section className="pg-stage mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          <Link to="/services" className="pg-back">
            <ArrowLeft className="h-4 w-4" /> All tracks
          </Link>

          <h1 className="pg-cat-title">{category.title}</h1>
          <p className="pg-cat-blurb">{category.blurb}</p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {category.programs.map((p) => {
              const hasCourse = Boolean(p.courseSlug);
              const inner = (
                <>
                  <span className="pg-card-icon">
                    <Icon name={category.icon} size={20} />
                  </span>
                  <h3 className="pg-card-title">{p.title}</h3>
                  <p className="pg-card-blurb">{p.blurb}</p>
                  {hasCourse ? (
                    <span className="pg-card-cta">
                      <BookOpen className="h-4 w-4" /> Open knowledge base
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="pg-card-soon">Coming soon</span>
                  )}
                </>
              );
              return hasCourse ? (
                <Link
                  key={p.title}
                  to={`/services?category=${category.id}&course=${p.courseSlug}`}
                  className="pg-card"
                >
                  {inner}
                </Link>
              ) : (
                <div key={p.title} className="pg-card pg-card--static">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        <ProgramsStyles />
      </Layout>
    );
  }

  // ---- The landing, as designed -------------------------------------------
  return (
    <Layout>
      <SEO
        title="Programs"
        description="Explore forgeVidhya's tracks across AI and technology, core engineering, and the real-world skills school never taught you."
      />

      <section className="pg-stage relative mx-auto min-h-[70vh] max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        {/* the name, sitting far back behind the type */}
        <img src={wordmarkUrl} alt="" className="pg-watermark" aria-hidden="true" />

        <h1 className="pg-heading">Your journey starts here</h1>

        <div className="pg-tracks">
          {TRACKS.map((t, i) => (
            <div
              key={t.id}
              className="pg-track"
              style={{ "--pg-offset": t.offset, "--pg-i": i } as CSSProperties}
            >
              <Link to={`/services?category=${t.id}`} className="pg-track-link">
                <span className="pg-track-title">{t.title}</span>
              </Link>
              <p className="pg-track-caption">{t.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <ProgramsStyles />
    </Layout>
  );
}

/** Kept in one place so the landing and the category view cannot drift apart. */
function ProgramsStyles() {
  return (
    <style>{`
      .pg-stage { position: relative; z-index: 1; }

      /* ---------- the name, far back ---------- */
      .pg-watermark {
        position: absolute;
        top: 22%;
        left: 50%;
        width: min(92%, 900px);
        transform: translateX(-50%);
        opacity: 0.13;
        pointer-events: none;
        user-select: none;
        z-index: -1;
      }

      /* ---------- "Your journey starts here" ---------- */
      .pg-stage .pg-heading {
        font-family: 'Press Start 2P', 'JetBrains Mono', ui-monospace, monospace;
        font-size: clamp(0.95rem, 2.4vw, 1.7rem);
        line-height: 1.5;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: #2a2a6e;
        margin: 0 0 clamp(2rem, 6vw, 4rem);
        text-shadow: 0 2px 0 rgba(255, 255, 255, 0.55);
      }

      /* ---------- the three tracks ---------- */
      .pg-tracks { display: flex; flex-direction: column; gap: clamp(2.2rem, 6vw, 4.2rem); }

      .pg-track {
        margin-left: var(--pg-offset, 0);
        /* The drift is on the row, not on hover: each one carries its own
           duration and delay off --pg-i so the three never swing together. */
        animation: pg-drift calc(9s + var(--pg-i) * 2.5s) ease-in-out infinite alternate;
        animation-delay: calc(var(--pg-i) * -1.7s);
        will-change: transform;
      }
      @keyframes pg-drift {
        from { transform: translateX(-14px); }
        to   { transform: translateX(14px); }
      }
      /* A link that never stops moving is a link that is hard to hit — a
         driving test could not click one of these at all until this was here,
         which is the same trouble anyone with an unsteady hand would have.
         The drift settles while the pointer is over the row, or while it holds
         focus, and picks up again on the way out. The design is untouched:
         this only decides when the motion rests. */
      .pg-track:hover,
      .pg-track:focus-within { animation-play-state: paused; }

      .pg-track-link {
        display: inline-block;
        text-decoration: none;
        outline: none;
      }

      .pg-track-title {
        display: inline-block;
        font-family: 'Fredoka', 'Comfortaa', 'Quicksand', 'Sora', system-ui, sans-serif;
        font-weight: 600;
        font-size: clamp(1.7rem, 4.6vw, 3rem);
        line-height: 1.15;
        letter-spacing: 0.01em;
        background: linear-gradient(180deg, #9fdcf8 0%, #59a8e4 46%, #2f6fc9 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 2px 1px rgba(255, 255, 255, 0.7))
                drop-shadow(0 3px 6px rgba(35, 70, 140, 0.28));
        transition: filter 0.3s ease;
      }
      /* No lift, no scale: the design does not hover. The only acknowledgement
         is the gradient brightening under the pointer. */
      .pg-track-link:hover .pg-track-title,
      .pg-track-link:focus-visible .pg-track-title {
        filter: drop-shadow(0 2px 1px rgba(255, 255, 255, 0.85))
                drop-shadow(0 4px 10px rgba(35, 70, 140, 0.42))
                brightness(1.08);
      }
      .pg-track-link:focus-visible {
        outline: 3px solid rgba(47, 111, 201, 0.55);
        outline-offset: 6px;
        border-radius: 6px;
      }

      .pg-track-caption {
        margin: 0.3rem 0 0 0.5rem;
        font-family: 'Space Grotesk', 'Sora', system-ui, sans-serif;
        font-weight: 700;
        font-size: clamp(0.72rem, 1.5vw, 0.95rem);
        letter-spacing: 0.01em;
        text-transform: uppercase;
        color: #14142b;
      }

      /* ---------- rose gold cards ---------- */
      .pg-back {
        display: inline-flex; align-items: center; gap: 0.4rem;
        font-size: 0.875rem; font-weight: 500; text-decoration: none;
        color: #6b5a72;
      }
      .pg-back:hover { color: #a70066; }

      .pg-stage .pg-cat-title {
        margin: 1.5rem 0 0;
        font-family: 'Fredoka', 'Sora', system-ui, sans-serif;
        font-weight: 600;
        font-size: clamp(1.8rem, 4.5vw, 2.8rem);
        background: linear-gradient(180deg, #9fdcf8 0%, #59a8e4 46%, #2f6fc9 100%);
        -webkit-background-clip: text; background-clip: text;
        color: transparent; -webkit-text-fill-color: transparent;
      }
      .pg-cat-blurb {
        margin: 0.5rem 0 0;
        font-weight: 600;
        color: #14142b;
      }

      .pg-card {
        display: flex; flex-direction: column;
        padding: 1.5rem;
        border-radius: 1.1rem;
        text-decoration: none;
        /* rose gold */
        background: linear-gradient(160deg,
          rgba(251, 233, 231, 0.94) 0%,
          rgba(232, 180, 184, 0.9) 52%,
          rgba(183, 110, 121, 0.88) 100%);
        border: 1px solid rgba(183, 110, 121, 0.55);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 14px 30px -18px rgba(120, 60, 75, 0.7);
        /* no transform on hover anywhere on this page */
        transition: box-shadow 0.32s ease, border-color 0.32s ease;
      }
      .pg-card:hover:not(.pg-card--static) {
        border-color: rgba(140, 70, 85, 0.85);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 18px 38px -18px rgba(120, 60, 75, 0.85);
      }

      .pg-card-icon {
        display: grid; place-items: center;
        height: 2.75rem; width: 2.75rem;
        border-radius: 0.8rem;
        background: rgba(255, 255, 255, 0.72);
        color: #8c3f52;
        box-shadow: 0 2px 8px -3px rgba(120, 60, 75, 0.6);
      }
      .pg-card-title {
        margin: 1rem 0 0;
        font-family: 'Sora', system-ui, sans-serif;
        font-weight: 700; font-size: 1.05rem; line-height: 1.35;
        color: #3d1621;
      }
      .pg-card-blurb {
        margin: 0.5rem 0 0; flex: 1;
        font-size: 0.875rem; line-height: 1.6;
        color: #5a2b38;
      }
      .pg-card-cta {
        display: inline-flex; align-items: center; gap: 0.4rem;
        margin-top: 1rem;
        font-size: 0.875rem; font-weight: 700;
        color: #7a2740;
      }
      .pg-card-soon {
        margin-top: 1rem;
        font-size: 0.72rem; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.08em;
        color: rgba(90, 43, 56, 0.65);
      }

      /* ---------- narrow screens ---------- */
      @media (max-width: 860px) {
        .pg-track { margin-left: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .pg-track { animation: none; }
      }
    `}</style>
  );
}
