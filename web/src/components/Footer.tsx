import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { navItems, siteConfig, services } from "@/lib/site";
import quillUrl from "@/assets/logo-quill.png";

/**
 * Footer — built to the supplied design.
 *
 * One wide rounded card, pink at the left and lavender at the right, split
 * into five columns by hairline rules: the brand, two link lists, the ways to
 * reach us, and the map.
 *
 * Every colour and proportion is measured off the artwork rather than judged
 * by eye. The column rules in it fall at 31.17%, 44.17%, 60.93% and 79.43% of
 * the width, which is where the grid below puts them. The headings are
 * #c6017a, the ink #15163a, the rules #e6e1f2, and the card runs #faf0f5 to
 * #e8ecfc.
 *
 * Nothing about where the links go has changed: the lists are still driven by
 * navItems and services, and the social, mail and map destinations still come
 * from siteConfig, so this stays in step with the rest of the site.
 */

/* ------------------------------------------------------------------ *
 * The social marks.
 *
 * The design uses each service's real logo, not a monoline icon set, so they
 * are drawn here. Four sit as a filled brand-coloured disc inside a white
 * chip; GitHub is the one that does not, and its Octocat sits on the white
 * directly. The colours are the artwork's own: its LinkedIn is #057dc9,
 * lighter than the brand's #0a66c2, and its Instagram is a circle rather than
 * the usual rounded square.
 * ------------------------------------------------------------------ */

function MarkX() {
  return (
    <svg viewBox="0 0 48 48" className="ft-mark" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#010101" />
      <path
        fill="#ffffff"
        d="M31.9 12h3.9l-8.5 9.8L37.3 36h-7.8l-6.1-8-7 8h-3.9l9.1-10.4L11 12h8l5.5 7.3L31.9 12Zm-1.4 21.7h2.2L18.6 14.2h-2.3l14.2 19.5Z"
      />
    </svg>
  );
}

function MarkLinkedIn() {
  return (
    <svg viewBox="0 0 48 48" className="ft-mark" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#057dc9" />
      <path
        fill="#ffffff"
        d="M17.4 19.9v16.2h-5.4V19.9h5.4Zm.35-5a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0Zm18.25 11.9v9.3h-5.4v-8.6c0-2.2-.8-3.7-2.7-3.7-1.5 0-2.4 1-2.8 2-.14.35-.18.84-.18 1.33v8.97h-5.4s.07-14.6 0-16.2h5.4v2.3a5.4 5.4 0 0 1 4.9-2.7c3.6 0 6.2 2.3 6.2 7.3Z"
      />
    </svg>
  );
}

function MarkInstagram() {
  return (
    <svg viewBox="0 0 48 48" className="ft-mark" aria-hidden="true">
      <defs>
        <radialGradient id="ft-ig" cx="0.3" cy="1.07" r="1.25">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.05" stopColor="#fdf497" />
          <stop offset="0.45" stopColor="#fd5949" />
          <stop offset="0.6" stopColor="#d6249f" />
          <stop offset="0.9" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#ft-ig)" />
      <g fill="none" stroke="#fffaf4" strokeWidth="2.6">
        <rect x="11.5" y="11.5" width="25" height="25" rx="8" />
        <circle cx="24" cy="24" r="6.1" />
      </g>
      <circle cx="31.3" cy="17" r="1.8" fill="#fffaf4" />
    </svg>
  );
}

function MarkYouTube() {
  return (
    <svg viewBox="0 0 48 48" className="ft-mark" aria-hidden="true">
      <circle cx="24" cy="24" r="21.5" fill="#ff0201" />
      <path fill="#ffffff" d="M31.5 24 20.2 30.5v-13L31.5 24Z" />
    </svg>
  );
}

function MarkGitHub() {
  return (
    <svg viewBox="0 0 48 48" className="ft-mark" aria-hidden="true">
      <path
        fill="#010101"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 3.2C12.5 3.2 3.2 12.5 3.2 24c0 9.2 6 17 14.2 19.8 1 .2 1.4-.5 1.4-1v-3.6c-5.8 1.3-7-2.8-7-2.8-.9-2.4-2.3-3-2.3-3-1.9-1.3.1-1.3.1-1.3 2.1.2 3.2 2.2 3.2 2.2 1.9 3.2 4.9 2.3 6.1 1.7.2-1.3.7-2.3 1.3-2.8-4.6-.5-9.5-2.3-9.5-10.3 0-2.3.8-4.2 2.2-5.6-.2-.6-1-2.7.2-5.6 0 0 1.8-.6 5.8 2.1a20 20 0 0 1 10.5 0c4-2.7 5.7-2.1 5.7-2.1 1.2 2.9.5 5 .2 5.6 1.4 1.4 2.2 3.3 2.2 5.6 0 8-4.9 9.8-9.5 10.3.7.7 1.4 1.9 1.4 3.9v5.8c0 .5.4 1.2 1.4 1C38.8 41 44.8 33.2 44.8 24c0-11.5-9.3-20.8-20.8-20.8Z"
      />
    </svg>
  );
}

/**
 * Keeps a hyphenated word whole.
 *
 * Left alone, "Career Accelerator for Tier-3 Engineers" breaks at the hyphen
 * and the column reads "...for Tier-" over "3 Engineers", which looks like a
 * typo rather than a line break. Every word carrying a hyphen is wrapped so
 * the line can only break at a space.
 */
function Unbroken({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`}>
          {i > 0 ? " " : ""}
          {word.includes("-") ? <span className="ft-nobr">{word}</span> : word}
        </span>
      ))}
    </>
  );
}

const SOCIALS = [
  { label: "X", href: siteConfig.social.twitter, Mark: MarkX },
  { label: "LinkedIn", href: siteConfig.social.linkedin, Mark: MarkLinkedIn },
  { label: "Instagram", href: siteConfig.social.instagram, Mark: MarkInstagram },
  { label: "YouTube", href: siteConfig.social.youtube, Mark: MarkYouTube },
  { label: "GitHub", href: siteConfig.social.github, Mark: MarkGitHub },
];

/** Filled, as the design draws them — lucide's are outlines. */
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="ft-ico" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v.3l-10 6.1L2 5.8v-.3Zm0 2.6 9.5 5.8a1 1 0 0 0 1 0L22 8.1V18.5a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5V8.1Z"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="ft-ico" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a7.5 7.5 0 0 0-7.5 7.5C4.5 15.4 12 22 12 22s7.5-6.6 7.5-12.5A7.5 7.5 0 0 0 12 2Zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z"
      />
    </svg>
  );
}

/**
 * The map tile.
 *
 * Drawn, not embedded: a real map needs an API key and their SDK, and a
 * keyless iframe renders broken. The artwork is a street grid in the design's
 * own colours — #d4e8fc under grey roads — and the authoritative address is
 * the text under it. The whole tile is the link, so the pin is not a separate
 * target.
 */
function MapTile() {
  return (
    <svg viewBox="0 0 300 150" className="ft-map" aria-hidden="true" preserveAspectRatio="none">
      <rect width="300" height="150" fill="#d4e8fc" />
      <g stroke="#a9aaac" fill="none" strokeLinecap="square">
        <path d="M-5 95 H305" strokeWidth="7" />
        <path d="M-5 38 H140" strokeWidth="6" />
        <path d="M150 60 H305" strokeWidth="6" />
        <path d="M60 -5 V155" strokeWidth="7" />
        <path d="M168 -5 V155" strokeWidth="6" />
        <path d="M248 -5 V155" strokeWidth="6" />
        <path d="M110 -5 V155" strokeWidth="5" />
        <path d="M95 -5 L135 60 L128 155" strokeWidth="5" />
        <path d="M168 118 H230 V155" strokeWidth="5" />
        <path d="M230 25 H305" strokeWidth="5" />
        <path d="M205 130 H305" strokeWidth="5" />
      </g>
      <g transform="translate(150 52)">
        <path
          fill="#d40284"
          d="M0 0a17 17 0 0 0-17 17c0 13 17 30 17 30s17-17 17-30A17 17 0 0 0 0 0Z"
        />
        <circle cy="17" r="6.6" fill="#ffffff" />
      </g>
    </svg>
  );
}

export function Footer() {
  const { email, location, address, name } = siteConfig;

  return (
    <footer className="ft-wrap">
      <div className="ft-card">
        <div className="ft-grid">
          {/* ---------- brand ---------- */}
          <div className="ft-col ft-brand">
            <Link to="/" className="ft-lockup" aria-label={`${name} — home`}>
              <img src={quillUrl} alt="" className="ft-quill" aria-hidden="true" />
              <span className="ft-wordmark">forgeVidhya</span>
            </Link>

            <p className="ft-tagline">
              <Unbroken text="Equipping first-year engineers from India's tier-3 colleges with future-ready AI skills — automation, production, and imagination." />
            </p>

            <ul className="ft-socials">
              {SOCIALS.map(({ label, href, Mark }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="ft-chip"
                  >
                    <Mark />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- explore ---------- */}
          <nav className="ft-col" aria-label="Explore">
            <h2 className="ft-head">Explore</h2>
            <ul className="ft-list">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="ft-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------- programs ---------- */}
          <nav className="ft-col" aria-label="Programs">
            <h2 className="ft-head">Programs</h2>
            <ul className="ft-list">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services#${s.slug}`} className="ft-link">
                    <Unbroken text={s.title} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------- stay in touch ---------- */}
          <div className="ft-col">
            <h2 className="ft-head">Stay in touch</h2>
            <ul className="ft-contact">
              <li>
                <span className="ft-ico-wrap">
                  <IconMail />
                </span>
                {/* Breaking anywhere split the domain mid-word, which reads
                    as a typo. The only break offered is after the @, so the
                    address either sits on one line or divides where an address
                    is meant to. */}
                <a href={`mailto:${email}`} className="ft-link ft-mail">
                  {email.split("@")[0]}@<wbr />
                  {email.split("@").slice(1).join("@")}
                </a>
              </li>
              <li>
                <span className="ft-ico-wrap">
                  <IconPin />
                </span>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-link"
                >
                  {/* One flowing string, not the pre-split lines: the design
                      wraps it mid-phrase, with "Foundation" falling onto the
                      second line, which only happens if the text is free to
                      break wherever the column ends. */}
                  <address className="ft-address">{address}</address>
                </a>
              </li>
            </ul>
          </div>

          {/* ---------- visit us ---------- */}
          <div className="ft-col">
            <h2 className="ft-head">Visit us</h2>
            <a
              href={location.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ft-visit"
              aria-label={`Open ${name}'s location in Mappls: ${address}`}
            >
              <span className="ft-map-frame">
                <MapTile />
              </span>
              <span className="ft-visit-addr">{address}</span>
              <span className="ft-visit-cta">
                Open in Maps
                <ArrowUpRight className="ft-visit-arrow" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .ft-wrap {
          margin-top: clamp(3rem, 7vw, 6rem);
          padding: 0 clamp(0.75rem, 2vw, 1.75rem) clamp(1rem, 2.5vw, 2rem);
        }

        /* ---------- the card ---------- */
        .ft-card {
          max-width: 1800px;
          margin: 0 auto;
          border-radius: clamp(1.25rem, 2.2vw, 2.25rem);
          padding: clamp(1.5rem, 2.8vw, 2.6rem) clamp(1.25rem, 2.6vw, 2.75rem);
          background: linear-gradient(100deg,
            #faf0f5 0%, #fbf7fc 42%, #f2f1fb 68%, #e8ecfc 100%);
          border: 1px solid rgba(255, 255, 255, 0.75);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.85) inset,
            0 18px 46px -28px rgba(63, 44, 96, 0.45);
        }

        /* ---------- the five columns ----------
           The widths are the artwork's: its rules fall at 31.17, 44.17, 60.93
           and 79.43 per cent of the card, which is what these ratios give. */
        .ft-grid {
          display: grid;
          grid-template-columns: 28fr 11fr 18.5fr 22fr 20.5fr;
          align-items: stretch;
        }
        .ft-col { min-width: 0; padding: 0 clamp(0.55rem, 1.2vw, 1.5rem); }
        .ft-col:first-child { padding-left: clamp(0.25rem, 0.8vw, 0.75rem); }
        .ft-col:last-child  { padding-right: clamp(0.25rem, 0.8vw, 0.75rem); }
        .ft-col + .ft-col { border-left: 1px solid #e6e1f2; }

        /* ---------- brand ---------- */
        .ft-lockup {
          display: flex;
          align-items: center;
          gap: clamp(0.4rem, 1vw, 0.75rem);
          text-decoration: none;
        }
        .ft-quill {
          width: clamp(42px, 4.6vw, 72px);
          height: auto;
          flex-shrink: 0;
          user-select: none;
        }
        .ft-wordmark {
          font-family: 'Poppins', 'Sora', system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(1.5rem, 3.1vw, 2.9rem);
          line-height: 1;
          letter-spacing: -0.015em;
          color: #15163a;
        }
        .ft-tagline {
          margin: clamp(0.9rem, 2vw, 1.4rem) 0 0;
          font-family: 'Poppins', 'Sora', system-ui, sans-serif;
          font-weight: 600;
          font-size: clamp(0.82rem, 1.12vw, 1.05rem);
          line-height: 1.45;
          color: #15163a;
        }

        .ft-socials {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(0.5rem, 1.3vw, 1.1rem);
          margin: clamp(1rem, 2.2vw, 1.6rem) 0 0;
          padding: 0;
          list-style: none;
        }
        .ft-chip {
          display: grid;
          place-items: center;
          width: clamp(38px, 3.7vw, 56px);
          height: clamp(38px, 3.7vw, 56px);
          border-radius: 50%;
          background: #ffffff;
          box-shadow:
            0 0 0 1px rgba(214, 206, 236, 0.55),
            0 4px 12px -3px rgba(86, 64, 120, 0.3);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .ft-chip:hover,
        .ft-chip:focus-visible {
          transform: translateY(-2px);
          box-shadow:
            0 0 0 1px rgba(198, 1, 122, 0.3),
            0 8px 18px -4px rgba(86, 64, 120, 0.42);
        }
        .ft-mark { width: 74%; height: 74%; display: block; }

        /* ---------- headings and lists ---------- */
        .ft-head {
          margin: 0 0 clamp(0.75rem, 1.7vw, 1.25rem);
          font-family: 'Poppins', 'Sora', system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(0.9rem, 1.3vw, 1.38rem);
          line-height: 1.1;
          letter-spacing: 0.005em;
          text-transform: uppercase;
          color: #c6017a;
        }
        .ft-list {
          display: flex;
          flex-direction: column;
          gap: clamp(0.5rem, 1.25vw, 1rem);
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .ft-link {
          font-family: 'Poppins', 'Sora', system-ui, sans-serif;
          font-weight: 600;
          font-size: clamp(0.78rem, 1vw, 1.04rem);
          line-height: 1.4;
          color: #15163a;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .ft-link:hover,
        .ft-link:focus-visible { color: #c6017a; }
        /* A touch smaller than its neighbours, which is what lets a
           28-character address hold one line in this column at the widths
           the card is actually seen at. */
        .ft-mail {
          word-break: normal;
          overflow-wrap: normal;
          font-size: clamp(0.72rem, 0.9vw, 0.95rem);
        }
        .ft-nobr { white-space: nowrap; }

        /* ---------- stay in touch ---------- */
        .ft-contact {
          display: flex;
          flex-direction: column;
          gap: clamp(0.9rem, 2vw, 1.5rem);
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .ft-contact li { display: flex; align-items: flex-start; gap: 0.6rem; }
        .ft-ico-wrap { flex-shrink: 0; color: #c6017a; line-height: 0; padding-top: 0.1em; }
        .ft-ico { width: clamp(17px, 1.5vw, 23px); height: clamp(17px, 1.5vw, 23px); display: block; }
        .ft-address { font-style: normal; display: flex; flex-direction: column; }

        /* ---------- visit us ---------- */
        .ft-visit { display: block; text-decoration: none; }
        .ft-map-frame {
          display: block;
          overflow: hidden;
          border-radius: clamp(0.6rem, 1.1vw, 1rem);
          box-shadow: 0 2px 10px -4px rgba(63, 44, 96, 0.4);
        }
        .ft-map {
          display: block;
          width: 100%;
          height: clamp(86px, 9vw, 140px);
          transition: transform 0.4s ease;
        }
        .ft-visit:hover .ft-map { transform: scale(1.04); }
        .ft-visit-addr {
          display: block;
          margin-top: clamp(0.55rem, 1.2vw, 0.9rem);
          font-family: 'Poppins', 'Sora', system-ui, sans-serif;
          font-weight: 600;
          font-size: clamp(0.78rem, 1.05vw, 1rem);
          line-height: 1.35;
          color: #15163a;
        }
        .ft-visit-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: clamp(0.35rem, 0.9vw, 0.65rem);
          font-family: 'Poppins', 'Sora', system-ui, sans-serif;
          font-weight: 600;
          font-size: clamp(0.78rem, 1.05vw, 1rem);
          color: #c6017a;
        }
        .ft-visit-arrow {
          width: 1em; height: 1em;
          transition: transform 0.22s ease;
        }
        .ft-visit:hover .ft-visit-arrow { transform: translate(2px, -2px); }

        /* ---------- narrower screens ----------
           Five columns cannot stay side by side on a tablet. Folding them
           three across strands "Visit us" alone on a row of its own with a
           third of the card empty beside it, so they fold two across instead:
           the brand over the full width, then Explore beside Programs and
           Stay in touch beside Visit us. Every row stays full. The rules turn
           with the layout — between a pair, and along the top of each row. */
        @media (max-width: 1100px) {
          .ft-grid { grid-template-columns: 1fr 1fr; }
          .ft-col {
            padding: clamp(1.1rem, 3vw, 1.65rem) clamp(0.8rem, 2.2vw, 1.4rem);
          }
          .ft-brand {
            grid-column: 1 / -1;
            padding: 0 0 clamp(1.1rem, 3vw, 1.65rem);
          }
          .ft-col + .ft-col { border-left: 0; border-top: 1px solid #e6e1f2; }
          .ft-col:nth-child(3),
          .ft-col:nth-child(5) { border-left: 1px solid #e6e1f2; }
          .ft-col:nth-child(2),
          .ft-col:nth-child(4) { padding-left: 0; }
          .ft-col:nth-child(3),
          .ft-col:nth-child(5) { padding-right: 0; }

          .ft-wordmark { font-size: clamp(1.6rem, 5.5vw, 2.4rem); }
          .ft-tagline, .ft-link, .ft-visit-addr, .ft-visit-cta { font-size: 0.94rem; }
          .ft-mail { font-size: 0.9rem; }
          .ft-head { font-size: 1.05rem; }
          .ft-chip { width: 46px; height: 46px; }
          .ft-map { height: clamp(110px, 16vw, 150px); }
        }

        /* One column on a phone, with the rules lying flat between sections. */
        @media (max-width: 640px) {
          .ft-grid { grid-template-columns: 1fr; }
          .ft-col { padding: clamp(1.1rem, 4vw, 1.5rem) 0 0; }
          .ft-brand { padding: 0 0 clamp(1.1rem, 4vw, 1.5rem); }
          .ft-col + .ft-col { border-left: 0; border-top: 1px solid #e6e1f2; }
          .ft-col:nth-child(3),
          .ft-col:nth-child(5) { border-left: 0; padding-right: 0; }
          .ft-quill { width: 52px; }
          .ft-wordmark { font-size: clamp(1.5rem, 8vw, 2.1rem); }
          .ft-map { height: clamp(140px, 42vw, 200px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ft-chip, .ft-map, .ft-visit-arrow { transition: none; }
          .ft-visit:hover .ft-map { transform: none; }
        }
      `}</style>
    </footer>
  );
}
