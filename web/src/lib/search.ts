// ============================================================
// Site-wide search index — every page, course, field, topic,
// blog post, and section is searchable and deep-linkable.
// ============================================================

import { services, engineeringFields, blogPosts } from "@/lib/site";

export type SearchEntry = {
  id: string;
  label: string;
  description?: string;
  /** Route path, optionally with a #hash anchor for precise sections. */
  path: string;
  group: string;
  /** Extra words that should match this entry. */
  keywords: string;
};

/** Builds the full search index from central site data. */
export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  // ---- Pages ----
  const pages: [string, string, string, string][] = [
    ["page-home", "Home", "/", "landing main start hero drone"],
    ["page-about", "About", "/about", "mission vision story team founders values"],
    ["page-programs", "Programs", "/services", "courses tracks catalog services learn"],
    ["page-blog", "Blog", "/blog", "articles posts writing field notes"],
    ["page-contact", "Contact", "/contact", "apply email phone reach talk enroll admission"],
    ["page-privacy", "Privacy Policy", "/privacy", "legal data"],
    ["page-terms", "Terms of Service", "/terms", "legal conditions"],
  ];
  for (const [id, label, path, keywords] of pages) {
    entries.push({ id, label, path, group: "Pages", keywords });
  }

  // ---- Sections ----
  const sections: [string, string, string, string, string][] = [
    ["sec-drone", "Interactive drone hero", "/#top", "Tap the drone to project the holographic city", "hologram city welcome"],
    ["sec-problem", "The problem we're fixing", "/#problem", "Why tier-3 colleges leave a gap — and what we replace it with", "syllabus gap mentors"],
    ["sec-how", "How it works", "/#how-it-works", "From zero to shipped in four moves", "apply matched build weekly open doors process steps"],
    ["sec-testimonials", "Student testimonials", "/#testimonials", "Tier-3 colleges. Real outcomes.", "reviews students quotes outcomes"],
    ["sec-showcase", "Showcase reel & media frames", "/#showcase", "Upload your own images & videos", "gallery upload media photos videos frames slots"],
    ["sec-mission", "Mission, Vision & Promise", "/about#mission", "Make AI skills universal, not elite", "vision promise free"],
    ["sec-story", "Our story", "/about#story", "From a WhatsApp group to a movement", "timeline 2024 2025 2026 history founders"],
    ["sec-values", "What we believe", "/about#values", "The values that shape every cohort", "ship over study values beliefs"],
    ["sec-founders", "A note from the founders", "/about#founders", "Three engineers. One shared background. One promise.", "team note quote"],
    ["sec-community", "Community learning over personalized learning", "/services#community", "Why cohort-based learning wins", "cohort peers whatsapp group community"],
    ["sec-catalog", "Engineering catalog", "/services#catalog", "Every engineering field, one playground", "fields seven 7 catalog"],
    ["sec-faq", "FAQ", "/services#faq", "Questions, answered", "questions certificate laptop free time coding"],
    ["sec-whatsapp", "Join the WhatsApp community", "/services#community", "Every course has a WhatsApp cohort", "whatsapp chat group join"],
  ];
  for (const [id, label, path, description, keywords] of sections) {
    entries.push({ id, label, description, path, group: "Sections", keywords });
  }

  // ---- AI tracks (courses) ----
  for (const s of services) {
    entries.push({
      id: `course-${s.slug}`,
      label: s.title,
      description: s.tagline,
      path: `/services#${s.slug}`,
      group: "AI Tracks",
      keywords: `course track program ${s.level} ${s.duration} ${s.description} ${s.outcomes.join(" ")}`,
    });
  }

  // ---- Engineering fields ----
  for (const f of engineeringFields) {
    entries.push({
      id: `field-${f.slug}`,
      label: f.title,
      description: f.subtitle,
      path: `/services#field-${f.slug}`,
      group: "Engineering Fields",
      keywords: `field catalog engineering ${f.aiIntegration} ${f.topics.map((t) => t.name).join(" ")} ${f.project ?? ""}`,
    });
    // Each topic is individually searchable and leads to its field.
    for (const t of f.topics) {
      entries.push({
        id: `topic-${f.slug}-${t.name}`,
        label: t.name,
        description: `In ${f.title}`,
        path: `/services#field-${f.slug}`,
        group: "Topics",
        keywords: `${t.detail} ${f.title}`,
      });
    }
  }

  // ---- Blog posts ----
  for (const p of blogPosts) {
    entries.push({
      id: `post-${p.slug}`,
      label: p.title,
      description: `${p.category} · ${p.readTime}`,
      path: `/blog/${p.slug}`,
      group: "Blog Posts",
      keywords: `blog article post ${p.category} ${p.author} ${p.excerpt}`,
    });
  }

  return entries;
}

/** Order groups appear in the palette. */
export const searchGroupOrder = [
  "Pages",
  "AI Tracks",
  "Engineering Fields",
  "Topics",
  "Sections",
  "Blog Posts",
];
