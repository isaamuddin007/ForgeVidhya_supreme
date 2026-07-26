import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Workflow,
  Cog,
  Sparkles,
  Rocket,
  CheckCircle2,
  Clock,
  Gauge,
  GraduationCap,
  Users,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { LinkButton } from "@/components/ui/button";
import { FadeIn, Icon, SectionHeading } from "@/components/ui/primitives";
import { MagicReveal } from "@/components/MagicReveal";
import {
  services,
  engineeringFields,
  programCategories,
  type Service,
  type EngineeringField,
} from "@/lib/site";

const accentCycle = ["sky", "blue", "red", "mint"] as const;

/** Community WhatsApp link — replace the number with the real one. */
const WHATSAPP_URL = "https://wa.me/919999999999";

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.5-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.07-.12-.27-.2-.57-.35Z" />
      <path d="M12.05 2a9.94 9.94 0 0 0-8.6 14.93L2 22l5.2-1.36A9.94 9.94 0 1 0 12.05 2Zm0 18.18c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.09.81.82-3.01-.2-.31a8.26 8.26 0 1 1 7.02 3.85Z" />
    </svg>
  );
}

function WhatsAppBadge({ label }: { label: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Join the ${label} WhatsApp community`}
      title="Join the WhatsApp community"
      onClick={(e) => e.stopPropagation()}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ff9500] text-white shadow-md transition-transform hover:scale-110 active:scale-95"
    >
      <WhatsAppLogo className="h-5 w-5" />
    </a>
  );
}

function FieldReveal({ field, index }: { field: EngineeringField; index: number }) {
  return (
    <MagicReveal
      accent={accentCycle[index % accentCycle.length]}
      anchorId={`field-${field.slug}`}
      icon={<Icon name={field.icon} size={22} />}
      title={`${field.number}. ${field.title}`}
      subtitle={field.subtitle}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#ff9500]/40 bg-[#ff9500]/10 p-3">
          <p className="text-sm font-medium text-foreground">
            Learn this field together — join the cohort on WhatsApp.
          </p>
          <WhatsAppBadge label={field.title} />
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-forge-gradient/10 p-3">
          <span className="rounded-full bg-forge-gradient px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Integration with AI
          </span>
          <span className="text-sm font-medium text-foreground">
            {field.aiIntegration}
          </span>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {field.topics.map((t) => (
            <li
              key={t.name}
              className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur"
            >
              <p className="font-display text-sm font-bold text-foreground">
                {t.name}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t.detail}
              </p>
            </li>
          ))}
        </ul>

        {field.project && (
          <div className="rounded-2xl border border-primary/30 bg-surface-gradient p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              Project example
            </p>
            <p className="mt-1.5 text-sm font-medium text-foreground">
              {field.project}
            </p>
          </div>
        )}
      </div>
    </MagicReveal>
  );
}

const iconMap: Record<string, typeof Workflow> = {
  Workflow,
  Cog,
  Sparkles,
  Rocket,
};

const faqs = [
  {
    q: "Do I need to know how to code?",
    a: "No. Two of our four tracks are explicitly designed for students with zero coding background. We meet you where you are and build from there.",
  },
  {
    q: "What if my laptop is slow or old?",
    a: "Everything we teach runs on a free cloud tier or a 4-year-old laptop. We deliberately avoid anything that requires a GPU or heavy local compute.",
  },
  {
    q: "Is the foundational track really free?",
    a: "Yes, and it will stay free. We charge only for the deeper, mentor-led tracks. The foundational AI Automation track is our gift to the community.",
  },
  {
    q: "How much time per week do I need?",
    a: "Plan for 6–8 hours a week. That's roughly one hour a day. The programs are built to fit around a full engineering course load.",
  },
  {
    q: "Will I get a certificate?",
    a: "You'll get a verifiable project certificate, but honestly, the shipped projects in your portfolio matter far more to employers than any PDF.",
  },
  {
    q: "Can I join if I'm not in my first year?",
    a: "Yes. We focus on first-years because that's where the biggest gap is, but we welcome second- and third-year students who want to start early.",
  },
];

function ServiceCard({ s, index }: { s: Service; index: number }) {
  const Cmp = iconMap[s.icon] ?? Sparkles;
  const reverse = index % 2 === 1;
  return (
    <FadeIn>
      <article
        id={s.slug}
        className="scroll-mt-28 rounded-3xl glass-card p-7 sm:p-9"
      >
        <div
          className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge">
                <Cmp className="h-7 w-7" />
              </span>
              <div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  {s.level}
                </span>
              </div>
              <div className="ml-auto">
                <WhatsAppBadge label={s.title} />
              </div>
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
              {s.title}
            </h3>
            <p className="mt-2 text-base font-medium text-primary">
              {s.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {s.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-forge-blue" />
                {s.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-forge-red" />
                {s.level}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-gradient p-6 shadow-forge">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              What you'll walk away with
            </p>
            <ul className="mt-4 space-y-3">
              {s.outcomes.map((o) => (
                <li
                  key={o}
                  className="flex items-start gap-2.5 rounded-xl bg-card/80 p-3 backdrop-blur"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forge-blue" />
                  <span className="text-sm font-medium text-foreground">{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}

/**
 * ProgramExplorer — a single "Explore programs" button that reveals three
 * category cards (AI & Tech, Core Engineering, Non-Engineering). Self-contained
 * state so it doesn't touch the page component. Cards stagger in via framer.
 */
function ProgramExplorer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-xl bg-forge-gradient px-6 py-3.5 text-base font-semibold text-white shadow-forge transition-transform hover:scale-[1.03] active:scale-95"
        >
          {open ? "Hide programs" : "Explore programs"}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="program-categories"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {programCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col rounded-3xl border border-border/60 glass-card p-6 shadow-forge sm:p-7"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge">
                    <Icon name={cat.icon} size={22} />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold">{cat.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
                  <ul className="mt-5 space-y-2.5">
                    {cat.items.map((item) => (
                      <li key={item.label}>
                        {item.to ? (
                          <Link
                            to={item.to}
                            className="group flex items-start gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                          >
                            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                            <span>{item.label}</span>
                          </Link>
                        ) : (
                          <span className="flex items-start gap-2 text-sm font-medium text-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forge-gradient" />
                            <span>{item.label}</span>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Services() {
  return (
    <Layout>
      <SEO
        title="Programs"
        description="AI tracks plus a full engineering catalog — Applied AI, Embedded Systems & IoT, CAD & Digital Manufacturing, Robotics, Renewable Energy, Supply Chain, and Technical Communication."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <FadeIn>
            <span className="inline-block rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Programs
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Pick the forge that
              <br />
              <span className="text-forge-gradient">fits your fire.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              AI tracks to get you started, plus a full engineering catalog —
              from embedded systems to robotics to supply chain. Every field
              ends with a real shipped project. Tap a bubble to reveal it.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Programs by category — the button reveals 3 category cards */}
      <section className="pt-10">
        <ProgramExplorer />
      </section>

      {/* Quick nav chips */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          {services.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <WhatsAppLogo className="h-4 w-4 text-[#ff9500]" />
              {s.title}
            </a>
          ))}
        </div>
      </section>

      {/* Community learning message */}
      <section id="community" className="mx-auto max-w-4xl scroll-mt-28 px-4 pt-14 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl glass-card p-8 text-center sm:p-10">
            <div className="absolute inset-0 -z-10 bg-forge-radial opacity-60" />
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge">
              <Users className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Community learning over{" "}
              <span className="text-forge-gradient">personalized learning</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Solo courses feel personal, but they leave you alone the moment
              you get stuck. We build every program around a cohort instead —
              you learn in public, ship alongside peers, get unstuck in
              minutes through the group, and stay accountable because someone
              is always posting their progress. The community is the
              curriculum: the questions, reviews, and shared wins of the batch
              teach you more than any personalized playlist ever will.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Services list */}
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        {services.map((s, i) => (
          <ServiceCard key={s.slug} s={s} index={i} />
        ))}
      </section>

      {/* Engineering catalog — magic reveal bubbles */}
      <section id="catalog" className="mx-auto max-w-4xl scroll-mt-28 px-4 py-10 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            eyebrow="The full catalog"
            title="Every engineering field, one playground"
            subtitle="We're not just an AI school. Tap any field to magically reveal what you'll actually learn — and the project you'll build with it."
          />
        </FadeIn>
        <div className="mt-10 space-y-4">
          {engineeringFields.map((f, i) => (
            <FadeIn key={f.slug} delay={i * 0.04}>
              <FieldReveal field={f} index={i} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Comparison / why us */}
      <section className="relative bg-card/40 py-20">
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-40" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Why forgeVidhya"
              title="Not your average online course"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="mt-10 overflow-hidden rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-left">
                    <th className="p-4 font-semibold">What you get</th>
                    <th className="p-4 text-center font-semibold text-muted-foreground line-through">
                      Typical MOOC
                    </th>
                    <th className="p-4 text-center font-semibold text-primary">
                      forgeVidhya
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    "Community learning over personalized learning",
                    "No repeated theory jargon",
                    "Flexible and agile schedule",
                    "Modern style curriculum",
                    "Real users for your project",
                    "Actual application for every theory piece",
                    "Cohort of peers who post their work",
                  ].map((row) => (
                    <tr key={row} className="bg-card/50">
                      <td className="p-4 font-medium">{row}</td>
                      <td className="p-4 text-center text-muted-foreground">—</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="mx-auto h-5 w-5 text-forge-blue" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        </FadeIn>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <FadeIn key={f.q} delay={i * 0.05}>
              <details className="group rounded-xl glass-card p-5 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between font-display text-base font-semibold marker:content-none">
                  {f.q}
                  <span className="ml-4 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-forge-gradient p-10 text-center text-white shadow-forge sm:p-16">
            <div className="absolute inset-0 grid-backdrop opacity-20" />
            <div className="relative">
              <GraduationCap className="mx-auto h-12 w-12" />
              <h2 className="mt-6 font-display text-3xl font-bold sm:text-4xl">
                Not sure which track is right for you?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/90">
                Tell us your branch and what you want to build. We'll point you
                to the right forge — no sales call, just honest advice.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-forge-blue shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Talk to us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
}
