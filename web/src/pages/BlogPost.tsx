import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { FadeIn } from "@/components/ui/primitives";
import { blogPosts, siteConfig } from "@/lib/site";

/**
 * Renders the lightweight markdown-ish body (H2, H3, p, ol/li).
 * Keeps the bundle tiny — no full markdown parser needed for this content.
 */
function renderBody(content: string) {
  const blocks = content.trim().split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="mt-10 font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="mt-8 font-display text-xl font-semibold tracking-tight"
        >
          {trimmed.slice(4)}
        </h3>
      );
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).filter(Boolean);
      return (
        <ol key={i} className="mt-4 list-decimal space-y-2 pl-6">
          {items.map((item, j) => (
            <li key={j} className="text-base leading-relaxed text-foreground/90">
              {item.replace(/^\d+\.\s/, "")}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <p
        key={i}
        className="mt-4 text-base leading-relaxed text-foreground/90"
      >
        {trimmed}
      </p>
    );
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);
  const fallback = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const recs = related.length ? related : fallback;
  const shareUrl = `${siteConfig.url}/blog/${post.slug}`;

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.excerpt}
        type="article"
        publishedTime={post.date}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>

          <FadeIn>
            <span className="mt-6 inline-block rounded-full bg-forge-gradient px-3 py-1 text-xs font-semibold text-white shadow-forge">
              {post.category}
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border/60 py-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-forge-blue" /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-forge-blue" />
                {new Date(post.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-forge-blue" /> {post.readTime}
              </span>
            </div>
          </FadeIn>
        </article>
      </section>

      {/* Cover */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          className={`relative h-56 overflow-hidden rounded-3xl bg-gradient-to-br ${post.cover} sm:h-72`}
        >
          <div className="absolute inset-0 grid-backdrop opacity-30" />
        </div>
      </div>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {renderBody(post.content)}
        </motion.div>

        {/* Share */}
        <div className="mt-12 flex items-center gap-3 border-t border-border/60 pt-6">
          <span className="text-sm font-medium text-muted-foreground">
            Share this article
          </span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              post.title
            )}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 glass-soft text-muted-foreground transition-all hover:scale-110 hover:text-foreground hover:shadow-forge"
            aria-label="Share on Twitter"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 glass-soft text-muted-foreground transition-all hover:scale-110 hover:text-foreground hover:shadow-forge"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(shareUrl);
              import("sonner").then(({ toast }) =>
                toast.success("Link copied to clipboard")
              );
            }}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 glass-soft text-muted-foreground transition-all hover:scale-110 hover:text-foreground hover:shadow-forge"
            aria-label="Copy link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold">Keep reading</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {recs.map((p, i) => (
            <FadeIn key={p.slug} delay={i * 0.08}>
              <Link
                to={`/blog/${p.slug}`}
                className="group flex h-full overflow-hidden rounded-2xl glass-card transition-all hover:-translate-y-1 hover:shadow-forge"
              >
                <div
                  className={`w-28 shrink-0 bg-gradient-to-br ${p.cover}`}
                />
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {p.category}
                  </span>
                  <h3 className="mt-2 font-display text-base font-bold leading-snug group-hover:text-primary">
                    {p.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-transform group-hover:translate-x-1">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </Layout>
  );
}
