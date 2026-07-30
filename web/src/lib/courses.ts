// ============================================================
// Course knowledge base
//
// Content is extracted from the source handbooks (one PDF per course) into
// web/src/data/courses/<slug>.json by scripts/parse (see repo notes). Each
// course is a set of chapters (modules); each chapter lists numbered
// sub-sections (topics); each topic holds typed content blocks.
//
// The Programs page renders a course as: chapter list -> click a topic
// (sub-section) -> an in-site "screen" shows that subtopic's blocks.
// ============================================================

import aiAutomation from "@/data/courses/ai-automation-fundamentals.json";
import manageExpenses from "@/data/courses/manage-expenses.json";
import pickMe from "@/data/courses/pick-me.json";
import imagination from "@/data/courses/imagination-to-life.json";
import appliedAi from "@/data/courses/applied-ai-indian-problems.json";
import cad from "@/data/courses/cad-digital-manufacturing.json";
import renewable from "@/data/courses/renewable-energy-mobility.json";
import robotics from "@/data/courses/robotics-mechatronics.json";
import investAi from "@/data/courses/invest-in-ai-tools.json";
import embedded from "@/data/courses/embedded-systems-iot.json";
import production from "@/data/courses/ai-production-engineering.json";
import negotiate from "@/data/courses/negotiate-interview-terms.json";

export type Block = { type: "p" | "pre"; text: string };

export type CourseTopic = {
  id: string;
  number: string; // e.g. "1.1"
  title: string;
  blocks: Block[];
};

export type CourseModule = {
  number: string; // e.g. "1" or "A"
  title: string;
  intro: Block[]; // content before the first sub-section
  topics: CourseTopic[];
};

export type Course = {
  slug: string;
  title: string;
  tagline: string;
  modules: CourseModule[];
};

// JSON is inferred as a broad type; assert the shape we generated.
const courses: Course[] = [
  aiAutomation as unknown as Course,
  manageExpenses as unknown as Course,
  pickMe as unknown as Course,
  imagination as unknown as Course,
  appliedAi as unknown as Course,
  cad as unknown as Course,
  renewable as unknown as Course,
  robotics as unknown as Course,
  investAi as unknown as Course,
  embedded as unknown as Course,
  production as unknown as Course,
  negotiate as unknown as Course,
];

const bySlug = new Map(courses.map((c) => [c.slug, c]));

export function getCourse(slug: string | null | undefined): Course | undefined {
  return slug ? bySlug.get(slug) : undefined;
}

export function courseTopicCount(course: Course): number {
  return course.modules.reduce((n, m) => n + m.topics.length, 0);
}
