import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { blogPosts, blogCategories } from "@/lib/site";

/**
 * Blog — built to the supplied design.
 *
 * The posts are hollow rose gold tech frames in one side-scrolling row,
 * filtered by the pills above them. Each frame is a genuine outline: an SVG
 * path with no fill, so the page shows through the middle, which a CSS border
 * cannot do once clip-path has cut the corners off.
 *
 * No image block at the head of a card — the design drops it.
 */

/** The design words two of these differently from the data. Showing its
 *  wording while filtering on the stored value keeps both correct. */
const LABELS: Record<string, string> = {
  Career: "Careers",
  "AI Production": "AI productions",
};

export default function Blog() {
  const [active, setActive] = useState<string>("All");

  const pills = useMemo(() => ["All", ...blogCategories], []);
  const filtered = useMemo(
    () => blogPosts.filter((p) => active === "All" || p.category === active),
    [active],
  );

  return (
    <Layout>
      <SEO
        title="Blog"
        description="Field notes for you to read — roadmaps, tutorials, careers and ideas for tier-3 engineering students building with AI."
      />

      <section className="bl-stage mx-auto max-w-[1400px] px-4 pb-20 pt-2 sm:px-6 lg:px-8">
        <div className="bl-top">
          <div className="bl-titles">
            <h1 className="bl-title">
              Blogs
              <span className="bl-spark" aria-hidden="true" />
            </h1>
            <p className="bl-standfirst">Field notes for you to read</p>
          </div>

          <div className="bl-pills" role="tablist" aria-label="Filter posts by category">
            {pills.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active === c}
                onClick={() => setActive(c)}
                className={`bl-pill${active === c ? " is-active" : ""}`}
              >
                {LABELS[c] ?? c}
              </button>
            ))}
          </div>
        </div>

        <div
          className="bl-rail"
          role="region"
          aria-label="Posts, scroll sideways"
          tabIndex={0}
        >
          {filtered.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="bl-card">
              {/* The frame itself: stroked, never filled, so the middle is
                  the page. preserveAspectRatio is off so it stretches to
                  whatever the card turns out to be. */}
              <svg
                className="bl-frame"
                viewBox="0 0 300 380"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className="bl-frame-edge"
                  d="M26,3 L274,3 L297,26 L297,354 L274,377 L26,377 L3,354 L3,26 Z"
                />
                {/* circuit traces, as in the design */}
                <g className="bl-frame-trace">
                  <path d="M3,70 L40,70 L52,58 L120,58" />
                  <path d="M297,112 L262,112 L250,100 L196,100" />
                  <path d="M3,320 L44,320 L56,332 L128,332" />
                  <rect x="118" y="54" width="8" height="8" />
                  <rect x="190" y="96" width="8" height="8" />
                  <rect x="126" y="328" width="8" height="8" />
                </g>
              </svg>

              <span className="bl-cat">{LABELS[p.category] ?? p.category}</span>

              <h2 className="bl-card-title">{p.title}</h2>

              <p className="bl-card-excerpt">{p.excerpt}</p>

              <span className="bl-meta">
                <span className="bl-meta-date">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(p.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>{p.readTime}</span>
              </span>
            </Link>
          ))}

          {filtered.length === 0 && (
            <p className="bl-empty">Nothing filed under that yet.</p>
          )}
        </div>
      </section>

      <style>{`
        .bl-stage { position: relative; z-index: 1; }

        /* ---------- masthead ---------- */
        .bl-top {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: clamp(1.5rem, 4vw, 2.75rem);
        }
        .bl-titles { position: relative; }

        /* Two classes: the page-heading rule in index.css is
           "main > section:first-of-type h1" — one class, three types — and a
           single class loses to it. */
        .bl-stage .bl-title {
          position: relative;
          margin: 0;
          font-family: 'Style Script', 'Segoe Script', cursive;
          font-weight: 400;
          font-size: clamp(3rem, 8vw, 5.5rem);
          line-height: 1;
          color: #14143f;
        }
        .bl-spark {
          position: absolute;
          left: 0.18em; top: 0.42em;
          width: 0.26em; height: 0.26em;
          border-radius: 50%;
          background: radial-gradient(circle, #ffffff 0%, #c86ae0 35%, rgba(150,60,200,0) 72%);
          box-shadow: 0 0 18px 6px rgba(176, 86, 214, 0.55);
          pointer-events: none;
          animation: bl-spark 3.6s ease-in-out infinite;
        }
        @keyframes bl-spark {
          0%, 100% { opacity: 0.65; transform: scale(0.92); }
          50%      { opacity: 1;    transform: scale(1.12); }
        }
        .bl-standfirst {
          margin: -0.35em 0 0 1.4em;
          font-family: 'Style Script', 'Segoe Script', cursive;
          font-size: clamp(1.2rem, 3vw, 2.1rem);
          line-height: 1.2;
          color: #c01a74;
        }

        /* ---------- category pills ---------- */
        .bl-pills { display: flex; flex-wrap: wrap; gap: 0.6rem; padding-top: 0.5rem; }
        .bl-pill {
          padding: 0.7rem 1.1rem;
          border-radius: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          font-size: 0.82rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(180deg, #d9398f 0%, #b01c6d 52%, #8d1256 100%);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.55) inset,
            0 -2px 6px rgba(90, 10, 55, 0.4) inset,
            0 6px 14px -6px rgba(140, 20, 85, 0.75);
          transition: box-shadow 0.25s ease, filter 0.25s ease;
        }
        .bl-pill:hover { filter: brightness(1.08); }
        .bl-pill.is-active {
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.8) inset,
            0 -2px 6px rgba(90, 10, 55, 0.5) inset,
            0 0 0 2px rgba(255, 255, 255, 0.75),
            0 8px 20px -6px rgba(140, 20, 85, 0.9);
        }

        /* ---------- the side-scrolling rail ---------- */
        .bl-rail {
          display: flex;
          gap: clamp(1.1rem, 2.5vw, 2rem);
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          padding: 0.5rem 0.25rem 1.5rem;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(183, 110, 121, 0.75) transparent;
        }
        .bl-rail::-webkit-scrollbar { height: 9px; }
        .bl-rail::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.35); border-radius: 9px; }
        .bl-rail::-webkit-scrollbar-thumb {
          border-radius: 9px;
          background: linear-gradient(90deg, #e8b4b8, #b76e79);
        }
        .bl-rail:focus-visible { outline: 3px solid rgba(183, 110, 121, 0.6); outline-offset: 4px; }

        /* ---------- one post ---------- */
        .bl-card {
          position: relative;
          flex: 0 0 auto;
          width: clamp(260px, 78vw, 300px);
          min-height: 380px;
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.7rem;
          padding: 2.4rem 2rem;
          text-decoration: none;
          text-align: center;
          /* hollow: nothing is painted behind the content */
          background: transparent;
        }
        .bl-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .bl-frame-edge {
          fill: none;
          stroke: #b76e79;
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 0 6px rgba(232, 180, 184, 0.9));
        }
        .bl-frame-trace path {
          fill: none;
          stroke: #cf8f97;
          stroke-width: 1.5;
          vector-effect: non-scaling-stroke;
        }
        .bl-frame-trace rect { fill: #e8b4b8; }

        .bl-card:hover .bl-frame-edge,
        .bl-card:focus-visible .bl-frame-edge {
          stroke: #a70066;
          filter: drop-shadow(0 0 11px rgba(232, 180, 184, 1));
        }

        .bl-cat {
          align-self: center;
          padding: 0.3rem 0.85rem;
          border-radius: 999px;
          border: 1px solid rgba(183, 110, 121, 0.6);
          background: rgba(255, 255, 255, 0.55);
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8d1256;
        }
        .bl-card-title {
          margin: 0.2rem 0 0;
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.32;
          color: #3d1030;
        }
        .bl-card-excerpt {
          margin: 0;
          font-size: 0.83rem;
          line-height: 1.55;
          color: #5c2a48;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bl-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 0.4rem;
          padding-top: 0.7rem;
          border-top: 1px solid rgba(183, 110, 121, 0.35);
          font-size: 0.72rem;
          font-weight: 600;
          color: #7a3b57;
        }
        .bl-meta-date { display: inline-flex; align-items: center; gap: 0.35rem; }

        .bl-empty {
          padding: 3rem 1rem;
          font-weight: 600;
          color: #5c2a48;
        }

        @media (prefers-reduced-motion: reduce) {
          .bl-spark { animation: none; }
        }
      `}</style>
    </Layout>
  );
}
