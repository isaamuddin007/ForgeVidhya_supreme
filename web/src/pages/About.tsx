import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Heart,
  Users,
  Globe2,
  TrendingUp,
  Compass,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { LinkButton } from "@/components/ui/button";
import { FadeIn, SectionHeading } from "@/components/ui/primitives";
import { MagicReveal } from "@/components/MagicReveal";

const values = [
  {
    icon: Target,
    title: "Ship over study",
    body: "We believe a shipped, ugly project beats a perfect, never-finished one. Every program ends with something real in the world.",
  },
  {
    icon: Heart,
    title: "Meet students where they are",
    body: "No condescension. No assumed background. If you've never written a line of code, that's a fine place to start.",
  },
  {
    icon: Globe2,
    title: "Tier-3 is a feature",
    body: "Students from constrained backgrounds build differently — scrappy, resourceful, and closer to real problems. We treat that as an advantage.",
  },
  {
    icon: TrendingUp,
    title: "Open doors, not gates",
    body: "We don't sell certificates. We sell the first project, the first post, the first freelance check, the first interview callback.",
  },
];

const timeline = [
  {
    year: "2024",
    title: "The frustration",
    body: "Three engineers from tier-3 colleges, all working at AI startups, noticed the same thing: no one from their hometowns was making it through the door.",
  },
  {
    year: "2025",
    title: "The first cohort",
    body: "12 students. One WhatsApp group. A six-week pilot on AI automation. 10 of them shipped a working project. 3 landed their first paid AI work.",
  },
  {
    year: "2026",
    title: "1,200 students and counting",
    body: "Now four tracks, 37 hiring startup partners, and students from over 80 tier-3 colleges across India. The foundational track stays free, always.",
  },
];

export default function About() {
  return (
    <Layout>
      <SEO
        title="About Us"
        description="forgeVidhya was started by tier-3 engineers who made it into AI startups and came back to pull others up. Our mission, values, and story."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <FadeIn>
            <span className="inline-block rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              About forgeVidhya
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              We came from where you are.
              <br />
              <span className="text-forge-gradient">We came back for you.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              forgeVidhya is an educational platform built specifically for
              first-year engineering students in India's tier-3 colleges — the
              students the system forgets. We teach the AI skills the industry
              is hiring for right now: automation, production, and turning
              imagination into shippable reality.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission / Vision / Promise */}
      <section id="mission" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Target,
              tag: "Mission",
              title: "Make AI skills universal, not elite",
              body: "Ensure that a student's college ranking never decides whether they can build with AI. We bring startup-grade AI training to the campuses everyone else skips.",
            },
            {
              icon: Eye,
              tag: "Vision",
              title: "A generation of tier-3 AI builders",
              body: "By 2030, we want a tier-3 first-year student to be as likely to ship a real AI product as an IIT student. The talent is there. Only the access is missing.",
            },
            {
              icon: Compass,
              tag: "Promise",
              title: "Always start free, always ship real",
              body: "Our foundational track will always be free. Every paid program ends with a real, public, shippable project — not a certificate that lives in a drawer.",
            },
          ].map((c, i) => (
            <FadeIn key={c.tag} delay={i * 0.1}>
              <div className="h-full rounded-2xl glass-card p-7">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-forge-gradient text-white shadow-forge">
                  <c.icon className="h-6 w-6" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">
                  {c.tag}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Story / Timeline — magic reveal */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <MagicReveal
          accent="sky"
          anchorId="story"
          icon={<Compass className="h-5 w-5" />}
          title="Our story"
          subtitle="From a WhatsApp group to a movement — tap to reveal"
        >
        <div className="space-y-10">
          {timeline.map((t, i) => (
            <FadeIn key={t.year} delay={i * 0.1}>
              <div className="relative grid gap-6 sm:grid-cols-[120px_1fr]">
                <div className="sm:text-right">
                  <span className="font-mono text-3xl font-bold text-forge-gradient-static">
                    {t.year}
                  </span>
                </div>
                <div className="relative border-l-2 border-border pl-6 sm:pl-8">
                  <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-forge-gradient shadow-forge" />
                  <h3 className="font-display text-xl font-bold">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.body}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        </MagicReveal>
      </section>

      {/* Values — magic reveal */}
      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <MagicReveal
          accent="mint"
          anchorId="values"
          icon={<Heart className="h-5 w-5" />}
          title="What we believe"
          subtitle="The values that shape every cohort — tap to reveal"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.08}>
                <div className="flex h-full gap-5 rounded-2xl glass-card p-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-forge-gradient text-white shadow-forge">
                    <v.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {v.body}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </MagicReveal>
      </section>

      {/* Team / Founders note */}
      <section id="founders" className="mx-auto max-w-4xl scroll-mt-28 px-4 py-10 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-3xl bg-surface-gradient p-8 shadow-forge sm:p-12">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge">
                <Users className="h-7 w-7" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-secondary-foreground">
                  A note from the founders
                </h2>
                <p className="text-sm text-secondary-foreground/80">
                  Three engineers. One shared background. One promise.
                </p>
              </div>
            </div>
            <blockquote className="mt-6 text-base leading-relaxed text-secondary-foreground/90">
              "We all made it out of tier-3 colleges by accident — a YouTube
              video here, a kind stranger on Discord there. forgeVidhya is the
              thing we wish had existed when we were eighteen: a clear path, a
              mentor who'd been where we were, and a peer group that believed
              shipping was possible. We're not here to sell you a dream. We're
              here to hand you the hammer."
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-secondary-foreground">
              — The forgeVidhya team
            </p>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl glass-card p-8 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Ready to forge your future?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cohort #4 admissions are open. The foundational track is free.
              </p>
            </div>
            <LinkButton to="/contact" size="lg">
              Apply now
            </LinkButton>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
}
