import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Calendar, Clock, User } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { FadeIn, SectionHeading } from "@/components/ui/primitives";
import { blogPosts, blogCategories } from "@/lib/site";

export default function Blog() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchesCat = active === "All" || p.category === active;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, active]);

  const featured = blogPosts[0];

  return (
    <Layout>
      <SEO
        title="Blog"
        description="Practical AI guides, roadmaps, and field notes for tier-3 engineering students building with AI — automation, production, and imagination."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <FadeIn>
            <span className="inline-block rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              The Forge Journal
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Field notes for
              <br />
              <span className="text-forge-gradient">tier-3 AI builders</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Roadmaps, tutorials, and career strategies written specifically
              for students without access to big-college labs or mentors.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Featured post */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Link
            to={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl glass-card lg:grid-cols-2"
          >
            <div
              className={`relative h-64 bg-gradient-to-br ${featured.cover} lg:h-auto`}
            >
              <div className="absolute inset-0 grid-backdrop opacity-30" />
              <span className="absolute left-5 top-5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                Featured · {featured.category}
              </span>
            </div>
            <div className="p-8 sm:p-10">
              <h2 className="font-display text-2xl font-bold leading-snug group-hover:text-primary sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {featured.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {featured.readTime}
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                Read the article <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </FadeIn>
      </section>

      {/* Search + filter */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Search articles"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...blogCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active === cat
                    ? "bg-forge-gradient text-white shadow-forge"
                    : "border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.06}>
              <Link
                to={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl glass-card transition-all hover:-translate-y-1 hover:shadow-forge"
              >
                <div
                  className={`relative h-40 bg-gradient-to-br ${post.cover}`}
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
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No articles match your search. Try a different keyword.
          </p>
        )}
      </section>
    </Layout>
  );
}
