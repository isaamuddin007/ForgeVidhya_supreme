import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="bl-card glass-card card-hover"
            >
              <span className={`bl-card-cover bg-gradient-to-br ${p.cover}`} />
              <span className="bl-card-body">
                <span className="bl-cat">{LABELS[p.category] ?? p.category}</span>
                <span className="bl-card-title">{p.title}</span>
                <span className="bl-read">
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </span>
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

        /* ---------- one post ----------
           The treatment from the "Keep reading" cards: a gradient panel at
           the left, the words at the right. The rose gold comes from the
           living-box styles in index.css, which .card-hover carries. */
        .bl-card {
          flex: 0 0 auto;
          width: clamp(280px, 86vw, 430px);
          scroll-snap-align: start;
          display: flex;
          overflow: hidden;
          border-radius: 1rem;
          text-decoration: none;
        }
        .bl-card-cover {
          width: 7rem;
          flex-shrink: 0;
        }
        .bl-card-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 1.25rem;
        }
        .bl-cat {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a70066;
        }
        .bl-card-title {
          margin-top: 0.5rem;
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.35;
          color: #3d1030;
        }
        .bl-read {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.85rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #7a3b57;
          transition: transform 0.25s ease;
        }
        .bl-card:hover .bl-read { transform: translateX(4px); }

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
