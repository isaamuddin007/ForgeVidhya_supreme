import { Instagram } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { siteConfig } from "@/lib/site";

/**
 * Contact — built to the supplied design.
 *
 * A rose gold panel at the left holding the two community links, the ways to
 * reach the company at the right. Nothing else: the form, the map and the
 * cohort boxes that used to be here are gone.
 *
 * Every detail comes from siteConfig, so the footer and this page can never
 * drift apart.
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

      <section className="ct-stage mx-auto max-w-7xl px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <h1 className="ct-title">
          Contact us
          <span className="ct-spark" aria-hidden="true" />
        </h1>
        <span className="ct-rule" aria-hidden="true" />

        <div className="ct-grid">
          {/* ---- community panel ---- */}
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
                  <a href={telHref} className="ct-link">{phone}</a>
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
                    {address}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <style>{`
        .ct-stage { position: relative; z-index: 1; }

        /* Two classes: "main > section:first-of-type h1" in index.css is one
           class and three types, and a single class loses to it. */
        .ct-stage .ct-title {
          position: relative;
          display: inline-block;
          margin: 0;
          font-family: 'Style Script', 'Segoe Script', cursive;
          font-weight: 400;
          font-size: clamp(2.6rem, 7vw, 5rem);
          line-height: 1.05;
          color: #1a1a8c;
        }
        .ct-spark {
          position: absolute;
          right: -0.42em; top: -0.08em;
          width: 0.3em; height: 0.3em;
          background:
            radial-gradient(circle, #fff 0%, #3b47ff 38%, rgba(59,71,255,0) 72%);
          border-radius: 50%;
          box-shadow: 0 0 20px 7px rgba(59, 71, 255, 0.5);
          animation: ct-spark 3.4s ease-in-out infinite;
        }
        @keyframes ct-spark {
          0%, 100% { opacity: 0.7; transform: scale(0.9); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        .ct-rule {
          display: block;
          width: min(360px, 60%);
          height: 2px;
          margin: 0.35rem 0 0 1.5rem;
          border-radius: 2px;
          background: linear-gradient(90deg, #1a1a8c 0%, #4b4bd8 60%, transparent 100%);
          transform: rotate(-1.6deg);
        }

        .ct-grid {
          display: grid;
          gap: clamp(2rem, 5vw, 4rem);
          margin-top: clamp(2.5rem, 6vw, 4.5rem);
          align-items: center;
        }
        @media (min-width: 900px) {
          .ct-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); }
        }

        /* ---------- community panel ---------- */
        .ct-panel {
          display: flex;
          flex-direction: column;
          gap: clamp(1.5rem, 4vw, 2.75rem);
          padding: clamp(1.75rem, 4vw, 2.75rem);
          border-radius: 1.5rem;
          border: 3px solid transparent;
          background:
            linear-gradient(rgba(255,255,255,0.28), rgba(255,255,255,0.14)) padding-box,
            linear-gradient(135deg, #f6d9d3 0%, #b76e79 35%, #e8b4b8 62%, #a4606c 100%) border-box;
          box-shadow:
            0 0 22px -6px rgba(183, 110, 121, 0.75),
            0 18px 40px -26px rgba(90, 40, 60, 0.8);
        }
        .ct-community-row {
          display: flex;
          align-items: center;
          gap: clamp(0.9rem, 2.5vw, 1.6rem);
          text-decoration: none;
        }
        .ct-icon { width: clamp(44px, 7vw, 72px); height: clamp(44px, 7vw, 72px); flex-shrink: 0; }
        .ct-icon--discord { color: #5865f2; }
        .ct-icon--insta { color: #c9348c; stroke-width: 1.6; }
        .ct-community {
          font-family: 'Style Script', 'Segoe Script', cursive;
          font-size: clamp(1.4rem, 3.4vw, 2.3rem);
          line-height: 1.15;
          color: #1a1a8c;
        }
        .ct-click {
          font-family: 'Style Script', 'Segoe Script', cursive;
          font-size: clamp(1.4rem, 3.4vw, 2.3rem);
          color: #c01a74;
        }
        a.ct-community-row:hover .ct-community,
        a.ct-community-row:hover .ct-click { text-decoration: underline; }

        /* ---------- reach us ---------- */
        .ct-reach-title {
          margin: 0 0 clamp(1.25rem, 3vw, 2rem);
          font-family: 'Style Script', 'Segoe Script', cursive;
          font-size: clamp(1.9rem, 4.6vw, 3.1rem);
          color: #c01a74;
        }
        .ct-rows { margin: 0; display: flex; flex-direction: column; gap: clamp(1.1rem, 3vw, 2.1rem); }
        .ct-row {
          display: grid;
          grid-template-columns: minmax(5.5rem, auto) 1fr;
          gap: 0.75rem 1.25rem;
          align-items: start;
        }
        .ct-key {
          font-family: 'Space Grotesk', 'Sora', system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(0.82rem, 1.9vw, 1.1rem);
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #123a6b;
        }
        .ct-val {
          margin: 0;
          font-family: 'Space Grotesk', 'Sora', system-ui, sans-serif;
          font-size: clamp(0.9rem, 2vw, 1.2rem);
          line-height: 1.45;
          color: #14143f;
          overflow-wrap: anywhere;
        }
        .ct-link { color: inherit; text-decoration: none; }
        .ct-link:hover { color: #a70066; text-decoration: underline; }

        @media (prefers-reduced-motion: reduce) {
          .ct-spark { animation: none; }
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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ct-community-row"
    >
      {inner}
    </a>
  ) : (
    <div className="ct-community-row">{inner}</div>
  );
}
