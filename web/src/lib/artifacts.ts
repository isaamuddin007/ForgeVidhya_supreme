// ============================================================
// Course artifacts
//
// Each entry is a self-contained standalone HTML tool that opens in a
// full-frame, sandboxed iframe over the site (see components/ArtifactModal).
// Keyed by course slug (see lib/courses) so a course's "hands-on" button only
// appears when it has an artifact. The HTML is imported raw and never runs in
// the app's own origin — the iframe sandbox isolates it.
// ============================================================

import flowStudioHtml from "@/artifacts/ai-automation-flow-studio.html?raw";

export type CourseArtifact = {
  /** Title shown in the modal header. */
  title: string;
  /** Label on the black launch button in the course view. */
  buttonLabel: string;
  /** Full standalone HTML document rendered inside the sandboxed iframe. */
  html: string;
};

const artifacts: Record<string, CourseArtifact> = {
  "ai-automation-fundamentals": {
    title: "Flow Studio — Automation Whiteboard",
    buttonLabel: "Open the automation whiteboard",
    html: flowStudioHtml,
  },
};

export function getArtifact(slug: string | null | undefined): CourseArtifact | undefined {
  return slug ? artifacts[slug] : undefined;
}
