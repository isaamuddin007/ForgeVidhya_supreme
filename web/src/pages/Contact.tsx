import {
  Mail,
  MapPin,
  Phone,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  GraduationCap,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { FadeIn } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site";

const socials = [
  { Icon: Twitter, href: siteConfig.social.twitter, label: "Twitter" },
  { Icon: Linkedin, href: siteConfig.social.linkedin, label: "LinkedIn" },
  { Icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
  { Icon: Youtube, href: siteConfig.social.youtube, label: "YouTube" },
  { Icon: Github, href: siteConfig.social.github, label: "GitHub" },
];

export default function Contact() {
  return (
    <Layout>
      <SEO
        title="Contact Us"
        description="Apply to forgeVidhya, ask about a program, or just say hello. We reply to every message within 24 hours."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <FadeIn>
            <span className="inline-block rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Contact
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Let's forge
              <span className="text-forge-gradient"> something together.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Applying to a cohort, asking about a program, or partnering with
              us to hire? Tell us your name, your college, and what you'd build
              if no one was watching.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Contact info */}
          <FadeIn>
            <div className="space-y-6">
              <div className="rounded-2xl glass-card p-6">
                <h2 className="font-display text-lg font-bold">
                  Reach us directly
                </h2>
                <ul className="mt-4 space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="font-medium hover:text-primary"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                      <Phone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                        className="font-medium hover:text-primary"
                      >
                        {siteConfig.phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <a
                        href={siteConfig.location.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary"
                      >
                        {siteConfig.address}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-surface-gradient p-6 shadow-forge">
                <h2 className="font-display text-lg font-bold text-secondary-foreground">
                  Follow the forge
                </h2>
                <p className="mt-1 text-sm text-secondary-foreground/80">
                  We post student builds and free tutorials daily.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-10 w-10 place-items-center rounded-lg bg-card/80 text-secondary-foreground backdrop-blur transition-all hover:scale-110 hover:text-foreground hover:shadow-forge"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl glass-card p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium">
                    Cohort #4 admissions close soon.
                  </p>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  The foundational AI Automation track is free, always. Paid
                  mentor-led tracks have limited seats for real 1:1 attention.
                </p>
              </div>
            </div>
          </FadeIn>

        </div>
      </section>
    </Layout>
  );
}
