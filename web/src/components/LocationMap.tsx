import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Navigation } from "lucide-react";
import { siteConfig } from "@/lib/site";

/**
 * LocationMap — the "visit us" card. Shows the office address and opens the
 * Mappls place page when clicked.
 *
 * It links out rather than embedding a live map: a Mappls map embed needs an
 * API key and their SDK, so a broken/keyless iframe would be worse than a clean
 * card. The panel on the left is a stylised stand-in (grid + pin), not a real
 * map — it never pretends to show live geography.
 *
 * Address and link both come from siteConfig.location, so there is one source
 * of truth shared with the footer and the Contact page.
 */
export function LocationMap() {
  const { location, address, name } = siteConfig;

  return (
    <motion.a
      href={location.mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${name}'s location in Mappls: ${address}`}
      className="glass-card group flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-forge sm:flex-row"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      {/* stylised map panel (decorative — not a live map) */}
      <div
        aria-hidden
        className="relative grid min-h-[160px] shrink-0 place-items-center overflow-hidden bg-primary/10 sm:w-56"
      >
        <div className="absolute inset-0 grid-backdrop opacity-70" />
        {/* suggestion of roads */}
        <div className="absolute inset-0">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/25" />
          <div className="absolute bottom-0 top-0 left-1/3 w-px bg-primary/20" />
          <div className="absolute bottom-0 top-0 right-1/4 w-px bg-primary/15" />
        </div>
        {/* pin */}
        <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[#2e6dff] text-white shadow-forge">
          <MapPin className="h-6 w-6" />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#2e6dff]"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>

      {/* address */}
      <div className="flex flex-1 flex-col justify-center gap-3 p-6 sm:p-7">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Visit us
          </span>
          <h3 className="mt-1 font-display text-xl font-bold tracking-tight">
            {name} — {location.city}
          </h3>
        </div>

        <address className="not-italic text-sm leading-relaxed text-muted-foreground">
          {location.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Navigation className="h-4 w-4" />
          Open in Mappls
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.a>
  );
}
