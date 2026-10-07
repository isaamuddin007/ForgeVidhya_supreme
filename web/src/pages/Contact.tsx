import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { siteConfig } from "@/lib/site";
import wordmarkUrl from "@/assets/logo-wordmark.png";

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

/**
 * The two marks, drawn to the artwork rather than borrowed from an icon set.
 *
 * Lucide's Instagram is a thin monoline outline and carries no gradient at
 * all, which is why the old one looked wrong next to the design: the artwork
 * uses Instagram's own glyph, a filled tile with the camera knocked out in
 * white. Measured off the artwork at 2016px wide, the tile is 82x82 and the
 * Clyde 210x160, so they are sized apart here too rather than both at once.
 */

/** Discord's Clyde, on its own 71x55 grid. evenodd punches the eyes out; the
 *  two ellipses sit behind so they read as the solid light of the artwork
 *  wherever the glass behind happens to be darker. */
function DiscordMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 71 55" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="23.726" cy="30.169" rx="6.4" ry="7.16" fill="#f7f4fc" />
      <ellipse cx="47.318" cy="30.169" rx="6.4" ry="7.16" fill="#f7f4fc" />
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.6791 44.9293 17.0515 44.6391 17.407 44.3461C17.4714 44.2926 17.5609 44.2813 17.6365 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.483 44.2898 53.5502 44.3433C53.9057 44.6363 54.2781 44.9293 54.6532 45.2082C54.7819 45.304 54.7735 45.5041 54.6336 45.5858C52.8649 46.6197 51.0262 47.4931 49.0924 48.2228C48.9665 48.2707 48.9105 48.4172 48.9721 48.5383C50.0383 50.6034 51.2557 52.5699 52.5962 54.435C52.6522 54.5139 52.7529 54.5477 52.8453 54.5195C58.6467 52.7249 64.5293 50.0174 70.6022 45.5576C70.6554 45.5182 70.689 45.459 70.6946 45.3942C72.1752 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
      />
    </svg>
  );
}

/** Instagram's glyph. The gradient is the brand's own, anchored low and left
 *  so the yellow sits at the bottom corner and the blue at the top — which is
 *  what reading the artwork's corners gives back: #f9bf6b at the foot,
 *  #7063cd at the head. */
function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="ct-ig" cx="0.3" cy="1.07" r="1.25">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.05" stopColor="#fdf497" />
          <stop offset="0.45" stopColor="#fd5949" />
          <stop offset="0.6" stopColor="#d6249f" />
          <stop offset="0.9" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="12" fill="url(#ct-ig)" />
      <g fill="none" stroke="#fffaf4" strokeWidth="2.6">
        <rect x="7.5" y="7.5" width="33" height="33" rx="10.3" />
        <circle cx="24" cy="24" r="7.3" />
      </g>
      <circle cx="32.3" cy="14.3" r="2" fill="#fffaf4" />
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
        <img src={wordmarkUrl} alt="" className="ct-watermark" aria-hidden="true" />

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
              icon={<InstagramMark className="ct-icon ct-icon--insta" />}
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
           Hollow: only the border is painted, so the animated glass shows
           through the middle exactly as it does in the artwork.

           The two-background-layer trick does not work here. It needs an
           opaque first layer clipped to padding-box to hide the middle, and
           there is no opaque colour to use — whatever sits behind is moving.
           A transparent first layer hides nothing, so the gradient simply
           floods the whole box and the frame comes out solid.

           Masking is what actually leaves a hole: paint the gradient over the
           whole box, then subtract the content-box from the mask so only the
           7px rim survives. */
        .ct-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(1.75rem, 4vw, 3rem);
          min-height: clamp(260px, 36vw, 420px);
          padding: clamp(1.75rem, 4vw, 3rem);
          border-radius: 1.75rem;
          background: none;
        }
        .ct-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 7px;
          background: linear-gradient(135deg,
            #f3d3cd 0%, #d79a9b 18%, #bd8488 38%,
            #f0cfca 55%, #b8787e 74%, #e2b3b2 100%);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
                  mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          filter: drop-shadow(0 0 10px rgba(189, 132, 136, 0.75));
          pointer-events: none;
        }
        .ct-community-row {
          display: flex;
          align-items: center;
          gap: clamp(1rem, 2.6vw, 2rem);
          text-decoration: none;
        }
        /* The artwork draws these at two different sizes — 210x160 for the
           Clyde against 82x82 for the tile — so one shared size was always
           going to look wrong. Each keeps its own aspect. */
        .ct-icon { flex-shrink: 0; display: block; }
        .ct-icon--discord {
          width: clamp(72px, 11.5vw, 150px);
          height: auto;
          /* read off the artwork, which renders the blurple a shade softer
             than the brand's flat #5865f2 */
          color: #6b78eb;
          filter: drop-shadow(0 2px 5px rgba(90, 100, 200, 0.28));
        }
        .ct-icon--insta {
          width: clamp(36px, 4.6vw, 62px);
          height: clamp(36px, 4.6vw, 62px);
          border-radius: 25%;
          filter: drop-shadow(0 2px 5px rgba(160, 60, 120, 0.3));
        }

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
