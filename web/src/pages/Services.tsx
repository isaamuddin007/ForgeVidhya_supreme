import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { CourseView } from "@/components/CourseView";
import { FadeIn, Icon, SectionHeading } from "@/components/ui/primitives";
import { programCategories } from "@/lib/site";
import { getCourse } from "@/lib/courses";

/**
 * Programs page — category-filtered, with an interactive knowledge base.
 *
 * Flow: the floating ProgramChooser (Programs bubble) routes here with
 * `?category=<id>` to show that category's programs. A program that has a
 * course routes to `?category=<id>&course=<slug>`, which opens the course's
 * knowledge base — chapters and clickable topics, each opening an in-site
 * screen. Visiting /services with no params shows the three category cards.
 */
export default function Services() {
  const [params] = useSearchParams();
  const categoryId = params.get("category");
  const courseSlug = params.get("course");
  const category = programCategories.find((c) => c.id === categoryId);
  const course = getCourse(courseSlug);

  // ---- Course knowledge base ----------------------------------------------
  if (course) {
    const backHref = category ? `/services?category=${category.id}` : "/services";
    const backLabel = category ? `${category.title} programs` : "All programs";
    return (
      <Layout>
        <SEO
          title={`${course.title} — Knowledge base`}
          description={course.tagline}
        />
        <CourseView course={course} backHref={backHref} backLabel={backLabel} />
      </Layout>
    );
  }

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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {category.programs.map((p, i) => {
              const hasCourse = Boolean(p.courseSlug);
              const inner = (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-forge-gradient text-white shadow-forge">
                    <Icon name={category.icon} size={20} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {p.blurb}
                  </p>
                  {hasCourse ? (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                      <BookOpen className="h-4 w-4" /> Open knowledge base
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                      Coming soon
                    </span>
                  )}
                </>
              );
              return (
                <FadeIn key={p.title} delay={i * 0.06}>
                  {hasCourse ? (
                    <Link
                      to={`/services?category=${category.id}&course=${p.courseSlug}`}
                      className="group flex h-full flex-col rounded-2xl border border-border/60 glass-card p-6 shadow-forge transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-forge-red"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col rounded-2xl border border-border/60 glass-card p-6 shadow-forge">
                      {inner}
                    </div>
                  )}
                </FadeIn>
              );
            })}
          </div>
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
    </Layout>
  );
}
