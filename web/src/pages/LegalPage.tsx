import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { FadeIn } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site";

/**
 * LegalPage — shared layout for Privacy Policy & Terms of Service.
 * Renders the supplied sections with semantic H2/H3 structure for SEO.
 */
type LegalSection = { heading: string; body: string[] };

function LegalPage({
  title,
  description,
  intro,
  sections,
  updated,
}: {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
  updated: string;
}) {
  return (
    <Layout>
      <SEO title={title} description={description} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <FadeIn>
            <span className="inline-block rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Legal
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {updated}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {intro}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {sections.map((s, i) => (
            <FadeIn key={s.heading} delay={i * 0.05}>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {s.heading}
                </h2>
                {s.body.map((p, j) => (
                  <p
                    key={j}
                    className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="mt-14 rounded-2xl glass-card p-6 text-sm text-muted-foreground">
          <p>
            Questions about this document? Email us at{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-medium text-primary hover:underline"
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </div>
      </section>
    </Layout>
  );
}

export { LegalPage };
export type { LegalSection };
