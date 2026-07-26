import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { siteConfig } from "@/lib/site";

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
};

/**
 * SEO — per-page meta tags, Open Graph, Twitter cards, and JSON-LD.
 * Injects schema markup (Organization by default; article on blog posts).
 */
export function SEO({
  title,
  description = siteConfig.description,
  image = "/icon.png",
  type = "website",
  publishedTime,
  noindex = false,
}: SEOProps) {
  const { pathname } = useLocation();
  const fullTitle = title
    ? `${title} · ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;
  const url = `${siteConfig.url}${pathname}`;

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    email: siteConfig.email,
    foundingDate: `${siteConfig.foundedYear}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.address,
      addressCountry: "IN",
    },
    sameAs: Object.values(siteConfig.social),
  };

  const articleSchema =
    type === "article" && publishedTime
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description,
          image,
          datePublished: publishedTime,
          author: { "@type": "Organization", name: siteConfig.name },
          publisher: { "@type": "Organization", name: siteConfig.name },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        }
      : null;

  return (
    <Helmet>
      {/* Primary meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteConfig.name} />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * ScrollToTop — resets scroll position on route change.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
