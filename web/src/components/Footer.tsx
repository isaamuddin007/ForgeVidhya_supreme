import { Link } from "react-router-dom";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  Mail,
  MapPin,
  Zap,
} from "lucide-react";
import { LocationMap } from "@/components/LocationMap";
import { navItems, siteConfig, services } from "@/lib/site";
import { subscribeNewsletter } from "@/lib/backend";

/**
 * Footer — quick links, programs, social icons, newsletter mini-form.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="glass-bar relative mt-24 border-t">
      <div className="absolute inset-x-0 top-0 h-px bg-forge-gradient" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-10">
        <div className="grid flex-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-forge-gradient shadow-forge">
                <Zap className="h-5 w-5 text-white" fill="white" />
              </span>
              <span className="font-display text-lg font-bold">
                forge
                <span className="text-forge-gradient-static">Vidhya</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Equipping first-year engineers from India's tier-3 colleges with
              future-ready AI skills — automation, production, and imagination.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { Icon: Twitter, href: siteConfig.social.twitter, label: "Twitter" },
                { Icon: Linkedin, href: siteConfig.social.linkedin, label: "LinkedIn" },
                { Icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
                { Icon: Youtube, href: siteConfig.social.youtube, label: "YouTube" },
                { Icon: Github, href: siteConfig.social.github, label: "GitHub" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 glass-soft text-muted-foreground transition-all hover:scale-110 hover:text-foreground hover:shadow-forge"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Programs
            </h3>
            <ul className="mt-4 space-y-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/services#${s.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Stay in touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-forge-blue" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-foreground"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forge-red" />
                <a
                  href={siteConfig.location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {siteConfig.address}
                </a>
              </li>
            </ul>

            <form
              className="mt-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector(
                  "input[type=email]"
                ) as HTMLInputElement;
                const email = input?.value?.trim();
                if (!email) return;
                const { toast } = await import("sonner");
                try {
                  const result = await subscribeNewsletter(email);
                  input.value = "";
                  toast.success(
                    result.alreadySubscribed
                      ? "You're already on the list!"
                      : "Subscribed! Welcome to the forge."
                  );
                } catch (err) {
                  console.error("newsletter subscribe failed:", err);
                  toast.error(
                    err instanceof Error ? err.message : "Couldn't subscribe. Please try again."
                  );
                }
              }}
            >
              <label
                htmlFor="newsletter-email"
                className="block text-xs font-medium text-muted-foreground"
              >
                Get our weekly AI-builds newsletter
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="you@college.edu"
                  className="min-w-0 flex-1 rounded-lg glass-input px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-forge-gradient px-3 py-2 text-sm font-semibold text-white shadow-forge transition-transform hover:scale-105 active:scale-95"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

          {/* Office location — square map tile, opens Mappls.
              The width lives on this wrapper (not on the tile) because the tile
              is w-full: sizing the flex item directly avoids a circular
              content-size resolution that collapses it to a couple of pixels. */}
          <div className="flex justify-center lg:w-56 lg:shrink-0">
            <LocationMap />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteConfig.name}. Built for students who refuse to wait.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
