import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Workflow,
  Cog,
  Rocket,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { LinkButton } from "@/components/ui/button";
import { FadeIn, Icon, SectionHeading } from "@/components/ui/primitives";
import { HeroStage } from "@/components/HeroStage";
import { SiteAnnouncement } from "@/components/SiteAnnouncement";
import { MagicReveal } from "@/components/MagicReveal";
import { services, blogPosts, siteConfig } from "@/lib/site";
import { useRevealStagger } from "@/lib/reveal";

const iconMap: Record<string, typeof Workflow> = {
  Workflow,
  Cog,
  Sparkles,
  Rocket,
};

export default function Home() {
  const latestPosts = blogPosts.slice(0, 3);
  const reveal = useRevealStagger();

  return (
    <Layout>
      <SEO
        title="AI skills for tier-3 engineering students"
        description={siteConfig.description}
      />

      {/* Admin-published announcement (hidden when none is set) */}
      <SiteAnnouncement />

      {/* ===================== HERO ===================== */}
      <HeroStage />

      {/* ===================== INTRO / PROBLEM ===================== */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <MagicReveal
          accent="red"
          anchorId="problem"
          icon={<Icon name="AlertTriangle" size={22} />}
          title="The problem we're fixing"
          subtitle="Your college won't teach you this. The industry already expects it. Tap to reveal."
        >
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-base leading-relaxed text-muted-foreground">
              India produces over 1.5 million engineering graduates a year. Most
              tier-3 colleges still teach C on Turbo C++ and call AI a final-year
              elective. Meanwhile, startups are hiring students who can ship AI
              automations on day one. That gap is where careers die — or get
              forged.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Outdated syllabus that ignores modern AI tooling",
                "No access to mentors who've shipped real AI products",
                "No peer group that pushes you to build in public",
                "Zero guidance on turning skills into income",
              ].map((p, i) => (
                <motion.div
                  key={p}
                  {...reveal(i * 0.1)}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-forge-red/15 text-forge-red">
                    ×
                  </span>
                  <p className="text-sm text-muted-foreground">{p}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <FadeIn delay={0.15}>
            <div className="relative rounded-3xl bg-surface-gradient p-8 shadow-forge">
              <div className="absolute inset-0 rounded-3xl bg-forge-radial opacity-40" />
              <div className="relative">
                <h3 className="font-display text-2xl font-bold text-secondary-foreground">
                  What we replace it with
                </h3>
                <div className="mt-6 space-y-4">
                  {[
                    "A live, current AI curriculum updated every quarter",
                    "Mentors from tier-3 backgrounds who shipped at startups",
                    "A cohort of builders who post their work weekly",
                    "A direct path from project → portfolio → first income",
                  ].map((p, i) => (
                    <motion.div
                      key={p}
                      {...reveal(i * 0.1)}
                      className="flex items-start gap-3 rounded-xl glass-soft p-3 backdrop-blur"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forge-blue" />
                      <p className="text-sm font-medium text-foreground">{p}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
        </MagicReveal>
      </section>

      {/* ===================== SERVICES PREVIEW ===================== */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            eyebrow="Programs"
            title="AI tracks plus seven engineering fields."
            subtitle="Start with AI, then go deep across embedded systems, robotics, CAD, energy, supply chain and more. Every program is built around shipping real things."
          />
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((s, i) => {
            const Cmp = iconMap[s.icon] ?? Sparkles;
            return (
              <FadeIn key={s.slug} delay={i * 0.08}>
                <Link
                  to="/services"
                  className="group block h-full rounded-2xl glass-card p-6 card-hover"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-forge-gradient text-white shadow-forge transition-transform group-hover:scale-110">
                      <Cmp className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {s.level}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {s.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                    <span className="text-xs text-muted-foreground">
                      {s.duration}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how-it-works" className="relative scroll-mt-28 overflow-hidden glass-bar py-20">
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="How it works"
              title="From zero to shipped in four moves"
            />
          </FadeIn>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { n: "01", t: "Apply", d: "Tell us your branch, college, and what you'd build if no one was watching." },
              { n: "02", t: "Get matched", d: "We pair you with a mentor who came from a similar background." },
              { n: "03", t: "Build weekly", d: "Ship one small thing every week. Post it. Get feedback. Repeat." },
              { n: "04", t: "Open doors", d: "Portfolio, content, and warm intros to our hiring startup partners." },
            ].map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.1}>
                <div className="relative">
                  <span className="font-mono text-4xl font-bold text-forge-gradient-static">
                    {step.n}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">
                    {step.t}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.d}
                  </p>
                  {i < 3 && (
                    <div className="absolute right-0 top-6 hidden h-px w-8 bg-forge-gradient md:block" />
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== BLOG PREVIEW ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              center={false}
              eyebrow="Latest writing"
              title="Field notes from the forge"
            />
            <LinkButton to="/blog" variant="outline" size="sm">
              All posts <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </FadeIn>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {latestPosts.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.08}>
              <Link
                to={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl glass-card card-hover"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${post.cover} relative`}
                >
                  <div className="absolute inset-0 grid-backdrop opacity-30" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-bold leading-snug group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-forge-gradient p-10 text-center text-white shadow-forge sm:p-16">
            <div className="absolute inset-0 bg-forge-radial opacity-30" />
            <div className="absolute inset-0 grid-backdrop opacity-20" />
            <div className="relative">
              <GraduationCap className="mx-auto h-12 w-12" />
              <h2 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-5xl">
                Your degree is not your ceiling.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/90">
                Cohort #4 starts soon. Seats are limited so every student gets
                real mentor attention. Apply today — the foundational track is
                free.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-forge-blue shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Apply now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  See the programs
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
}
