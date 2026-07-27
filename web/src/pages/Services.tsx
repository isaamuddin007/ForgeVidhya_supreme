import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Workflow } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { FadeIn, Icon, SectionHeading } from "@/components/ui/primitives";
import { WorkflowToolModal } from "@/components/WorkflowToolModal";
import { programCategories } from "@/lib/site";

/**
 * Programs page — category-filtered.
 *
 * Reached from the floating ProgramChooser (opened by the Programs bubble):
 * clicking a category routes here with `?category=<id>` and only that
 * category's programs are shown. Visiting /services with no category shows the
 * three category cards so the page is never empty.
 */
export default function Services() {
  const [params] = useSearchParams();
  const categoryId = params.get("category");
  const category = programCategories.find((c) => c.id === categoryId);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  return (
    <Layout>
      <SEO
        title={category ? `${category.title} Programs` : "Programs"}
        description="Explore forgeVidhya's programs across AI & Tech, Core Engineering, and real-world Non-Tech skills."
      />

      {/* Hero / header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          {category ? (
            <FadeIn>
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> All categories
              </Link>
              <span className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Icon name={category.icon} size={14} />
                {category.title}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {category.title} <span className="text-forge-gradient">programs</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {category.blurb}
              </p>
            </FadeIn>
          ) : (
            <FadeIn>
              <SectionHeading
                eyebrow="Programs"
                title="Choose your track"
                subtitle="Pick a category to see the programs it offers."
              />
            </FadeIn>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        {category ? (
          <>
            {category.id === "ai-and-tech" && (
              <FadeIn>
                <div className="mb-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setWhiteboardOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-forge-gradient px-6 py-3.5 text-base font-semibold text-white shadow-forge transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    <Workflow className="h-4 w-4" />
                    Launch AI Automation Whiteboard
                  </button>
                </div>
              </FadeIn>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.programs.map((p, i) => (
                <FadeIn key={p.title} delay={i * 0.06}>
                  <div className="flex h-full flex-col rounded-2xl border border-border/60 glass-card p-6 shadow-forge">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-forge-gradient text-white shadow-forge">
                      <Icon name={category.icon} size={20} />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold leading-snug">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {p.blurb}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {programCategories.map((cat, i) => (
              <FadeIn key={cat.id} delay={i * 0.08}>
                <Link
                  to={`/services?category=${cat.id}`}
                  className="group flex h-full flex-col rounded-3xl border border-border/60 glass-card p-7 shadow-forge transition-all hover:-translate-y-1 hover:shadow-forge-red"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge transition-transform group-hover:scale-110">
                    <Icon name={cat.icon} size={22} />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold">{cat.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                    {cat.programs.length} programs
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                    View programs <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <WorkflowToolModal open={whiteboardOpen} onClose={() => setWhiteboardOpen(false)} />
    </Layout>
  );
}
