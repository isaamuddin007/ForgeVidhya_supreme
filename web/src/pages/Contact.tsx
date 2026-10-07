import { Instagram } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { siteConfig } from "@/lib/site";

/**
 * Contact — built to the supplied design.
 *
 * Colours are sampled from the artwork rather than guessed: the royal blue is
 * #07009c, the magenta #970766, the labels #0e3360 over values in #011b3a,
 * and the frame #bd8488.
 *
 * The lettering is Playfair Display italic — an upright formal script with
 * high stroke contrast. The first build used Style Script, which is a slanted
 * casual marker face and the wrong shape entirely.
 */

/** Lucide carries no Discord mark, so it is drawn here. */
function DiscordMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.036A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.095 2.157 2.418 0 1.334-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.095 2.157 2.418 0 1.334-.946 2.419-2.157 2.419Z" />
    </svg>
  );
}

export default function Contact() {
  const { email, phone, address, social } = siteConfig;
  const telHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

  return (
    <Layout>
      <SEO
        title="Contact"
        description={`Reach forgeVidhya by email at ${email}, by phone on ${phone}, or come and find us in Hyderabad.`}
      />

      <section className="ct-stage mx-auto max-w-[1500px] px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        {/* the name, far behind everything */}
        <img src="/logo-wordmark.png" alt="" className="ct-watermark" aria-hidden="true" />

        <div className="ct-head">
          <h1 className="ct-title">Contact us</h1>

          {/* the two hand-drawn strokes under the title */}
          <svg className="ct-swoosh" viewBox="0 0 420 46" preserveAspectRatio="none" aria-hidden="true">
            <path d="M8,40 C120,30 250,16 412,5" />
            <path d="M2,30 C118,21 248,8 398,0" />
          </svg>

          {/* the four-point star and its two companions */}
          <svg className="ct-star" viewBox="0 0 120 120" aria-hidden="true">
            <path className="ct-star-big" d="M62,6 C66,40 76,52 112,58 C76,64 66,76 62,110 C58,76 48,64 12,58 C48,52 58,40 62,6 Z" />
            <path className="ct-star-sm" d="M24,16 C26,30 30,35 44,38 C30,41 26,46 24,60 C22,46 18,41 4,38 C18,35 22,30 24,16 Z" transform="translate(-14,-10) scale(0.62)" />
            <path className="ct-star-sm" d="M24,16 C26,30 30,35 44,38 C30,41 26,46 24,60 C22,46 18,41 4,38 C18,35 22,30 24,16 Z" transform="translate(128,34) scale(0.5)" />
          </svg>
        </div>

        <div className="ct-grid">
          {/* ---- community panel: a hollow rose gold frame ---- */}
          <div className="ct-panel">
            <CommunityRow
              href={social.discord}
              icon={<DiscordMark className="ct-icon ct-icon--discord" />}
              label={
                <>
                  Be a part of
                  <br />
                  the community
                </>
              }
              labelClass="ct-community"
            />

            <CommunityRow
              href={social.instagram}
              icon={<Instagram className="ct-icon ct-icon--insta" />}
              label="click here"
              labelClass="ct-click"
            />
          </div>

          {/* ---- the ways to reach us ---- */}
          <div className="ct-reach">
            <p className="ct-reach-title">Reach us through…</p>

            <dl className="ct-rows">
              <div className="ct-row">
                <dt className="ct-key">Email</dt>
                <dd className="ct-val">
                  <a href={`mailto:${email}`} className="ct-link">{email}</a>
                </dd>
              </div>

              <div className="ct-row">
                <dt className="ct-key">Phone</dt>
                <dd className="ct-val">
                  <a href={telHref} className="ct-link">{phone.replace(/\s+/g, "")}</a>
                </dd>
              </div>

              <div className="ct-row">
                <dt className="ct-key">Address</dt>
                <dd className="ct-val">
                  <a
                    href={siteConfig.location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ct-link"
                  >
                    {siteConfig.location.lines.map((line, i) => (
                      <span key={line} className="ct-addr-line">
                        {line}
                        {i < siteConfig.location.lines.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <style>{`
        .ct-stage { position: relative; z-index: 1; }

        .ct-watermark {
          position: absolute;
          top: 26%; left: 48%;
          width: min(86%, 1050px);
          transform: translateX(-50%) rotate(-7deg);
          opacity: 0.14;
          pointer-events: none;
          user-select: none;
          z-index: -1;
        }

        /* ---------- masthead ---------- */
        .ct-head { position: relative; display: inline-block; padding-right: 5rem; }

        /* Two classes: "main > section:first-of-type h1" in index.css is one
           class and three types, and a single class loses to it. */
        .ct-stage .ct-title {
          margin: 0;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(2.8rem, 7.5vw, 6rem);
          line-height: 1.02;
          letter-spacing: 0.005em;
          color: #07009c;
        }
        .ct-swoosh {
          display: block;
          width: min(100%, 420px);
          height: clamp(22px, 3.2vw, 46px);
          margin-top: 0.1rem;
          overflow: visible;
        }
        .ct-swoosh path {
          fill: none;
          stroke: #07009c;
          stroke-width: 2.2;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
        }
        .ct-star {
          position: absolute;
          top: clamp(-2.2rem, -3vw, -1rem);
          right: 0;
          width: clamp(54px, 8vw, 104px);
          height: clamp(54px, 8vw, 104px);
          overflow: visible;
        }
        .ct-star-big { fill: #280cba; }
        .ct-star-sm  { fill: #3f27d6; }
        .ct-star { animation: ct-twinkle 3.6s ease-in-out infinite; }
        @keyframes ct-twinkle {
          0%, 100% { opacity: 0.8; transform: scale(0.96); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }

        .ct-grid {
          display: grid;
          gap: clamp(2rem, 5vw, 4.5rem);
          margin-top: clamp(2.5rem, 6vw, 4rem);
          align-items: center;
        }
        @media (min-width: 950px) {
          .ct-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr); }
        }

        /* ---------- community panel ----------
           Hollow: the border is painted, the middle is left alone so the page
           shows through, which is what the artwork does. */
        .ct-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(1.75rem, 4vw, 3rem);
          min-height: clamp(260px, 36vw, 420px);
          padding: clamp(1.75rem, 4vw, 3rem);
          border-radius: 1.75rem;
          border: 7px solid transparent;
          background:
            linear-gradient(transparent, transparent) padding-box,
            linear-gradient(135deg,
              #f3d3cd 0%, #d79a9b 18%, #bd8488 38%,
              #f0cfca 55%, #b8787e 74%, #e2b3b2 100%) border-box;
          box-shadow:
            0 0 26px -4px rgba(189, 132, 136, 0.85),
            0 0 0 1px rgba(255, 255, 255, 0.45) inset;
        }
        .ct-community-row {
          display: flex;
          align-items: center;
          gap: clamp(1rem, 2.6vw, 2rem);
          text-decoration: none;
        }
        .ct-icon { width: clamp(46px, 7.5vw, 96px); height: clamp(46px, 7.5vw, 96px); flex-shrink: 0; }
        .ct-icon--discord { color: #5865f2; }
        .ct-icon--insta { color: #c9348c; stroke-width: 1.5; }

        .ct-community, .ct-click {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 500;
          line-height: 1.18;
        }
        .ct-community { font-size: clamp(1.4rem, 3.6vw, 2.9rem); color: #040192; }
        .ct-click     { font-size: clamp(1.4rem, 3.6vw, 2.9rem); color: #940766; }
        a.ct-community-row:hover .ct-community,
        a.ct-community-row:hover .ct-click { text-decoration: underline; }

        /* ---------- reach us ---------- */
        .ct-reach-title {
          margin: 0 0 clamp(1.5rem, 3.5vw, 2.5rem);
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(2rem, 5vw, 3.9rem);
          line-height: 1.05;
          color: #970766;
        }
        .ct-rows { margin: 0; display: flex; flex-direction: column; gap: clamp(1.4rem, 3.4vw, 2.6rem); }
        .ct-row {
          display: grid;
          grid-template-columns: minmax(5rem, auto) 1fr;
          gap: 0.5rem 1.5rem;
          align-items: start;
        }
        .ct-key {
          font-family: 'Oswald', 'Space Grotesk', system-ui, sans-serif;
          font-weight: 700;
          font-size: clamp(1rem, 2.1vw, 1.65rem);
          letter-spacing: 0.01em;
          text-transform: uppercase;
          color: #0e3360;
          white-space: nowrap;
        }
        .ct-val {
          margin: 0;
          font-family: 'Oswald', 'Space Grotesk', system-ui, sans-serif;
          font-weight: 300;
          font-size: clamp(0.95rem, 2vw, 1.6rem);
          line-height: 1.28;
          color: #011b3a;
          overflow-wrap: anywhere;
        }
        .ct-addr-line { display: block; }
        .ct-link { color: inherit; text-decoration: none; }
        .ct-link:hover { color: #970766; text-decoration: underline; }

        @media (prefers-reduced-motion: reduce) {
          .ct-star { animation: none; }
        }
      `}</style>
    </Layout>
  );
}

/** A tile is only a link when there is somewhere real to send people. */
function CommunityRow({
  href,
  icon,
  label,
  labelClass,
}: {
  href?: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  labelClass: string;
}) {
  const inner = (
    <>
      {icon}
      <span className={labelClass}>{label}</span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="ct-community-row">
      {inner}
    </a>
  ) : (
    <div className="ct-community-row">{inner}</div>
  );
}
