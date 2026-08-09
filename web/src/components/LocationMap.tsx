import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * LocationMap — a square map tile showing the office location. Clicking it
 * opens the Mappls place page in a new tab.
 *
 * The map artwork is a stylised illustration, not live geography: a real Mappls
 * embed needs an API key and their SDK, and a keyless iframe would render
 * broken. The tile is decorative + a link; the address text beneath it is the
 * authoritative information.
 *
 * Address and link both come from siteConfig.location, so this stays in sync
 * with the footer and the Contact page from a single edit.
 */
export function LocationMap({ className }: { className?: string }) {
  const { location, address, name } = siteConfig;

  return (
    <motion.a
      href={location.mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${name}'s location in Mappls: ${address}`}
      className={cn(
        "glass-card group relative block aspect-square w-full max-w-xs overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-forge",
        className
      )}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      {/* ---- stylised map artwork (decorative) ---- */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="200" height="200" fill="rgba(46,109,255,0.06)" />

        {/* city blocks */}
        <g fill="rgba(46,109,255,0.11)">
          <rect x="14" y="16" width="46" height="34" rx="4" />
          <rect x="72" y="10" width="38" height="40" rx="4" />
          <rect x="132" y="22" width="52" height="28" rx="4" />
          <rect x="18" y="66" width="38" height="46" rx="4" />
          <rect x="120" y="66" width="64" height="34" rx="4" />
          <rect x="14" y="132" width="54" height="40" rx="4" />
          <rect x="86" y="140" width="44" height="34" rx="4" />
          <rect x="146" y="120" width="40" height="56" rx="4" />
        </g>

        {/* park */}
        <rect x="74" y="62" width="34" height="30" rx="6" fill="rgba(254,126,6,0.14)" />

        {/* water */}
        <path
          d="M0 118 C 40 108, 62 132, 96 124 C 130 116, 156 106, 200 112 L200 122 C 156 116, 132 126, 98 134 C 64 142, 40 118, 0 128 Z"
          fill="rgba(46,109,255,0.18)"
        />

        {/* roads */}
        <g stroke="rgba(46,109,255,0.30)" strokeLinecap="round" fill="none">
          <path d="M0 58 H200" strokeWidth="5" />
          <path d="M0 182 H200" strokeWidth="4" />
          <path d="M64 0 V200" strokeWidth="5" />
          <path d="M140 0 V200" strokeWidth="4" />
          <path d="M0 100 H200" strokeWidth="2.5" />
          <path d="M110 0 L172 200" strokeWidth="3" />
        </g>
      </svg>

      {/* ---- pin ---- */}
      <span className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
        <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[#fe7e06] text-white shadow-lg ring-4 ring-white/60">
          <MapPin className="h-6 w-6" />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#fe7e06]"
            animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </span>

      {/* ---- address strip ---- */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/92 to-transparent px-5 pb-4 pt-10">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          Visit us
        </span>
        <address className="mt-0.5 not-italic text-xs leading-relaxed text-foreground/85">
          {location.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Open in Mappls
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.a>
  );
}
