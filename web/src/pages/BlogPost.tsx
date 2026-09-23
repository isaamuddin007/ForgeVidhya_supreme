import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { FadeIn } from "@/components/ui/primitives";
import PaperReader from "@/components/PaperReader";
import { blogPosts, siteConfig } from "@/lib/site";

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

  const printed = new Date(post.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const byline = `${post.category} · ${post.author} · ${printed} · ${post.readTime}`;

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.excerpt}
        type="article"
        publishedTime={post.date}
      />

      {/*
        Nothing of the article is set on the screen. The headline, the
        standfirst, the byline and the whole body are printed onto the sheet
        below; all that is left out here is the way back to the index.

        This section is deliberately the first one in <main> and deliberately
        holds no heading: the page-heading rule in index.css is scoped to
        `main > section:first-of-type h1, h2`, and were the reader to sit here
        it would set the masthead in Style Script and brand orange — a colour
        that is unreadable on near-white paper.
      */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>
      </section>

      {/* The article, printed */}
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <PaperReader
          title={post.title}
          standfirst={post.excerpt}
          meta={byline}
          content={post.content}
        />
      </section>

      {/* Share */}
      <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 border-t border-border/60 pt-6">
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
                className="group flex h-full overflow-hidden rounded-2xl glass-card card-hover"
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
