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
import energyGridHtml from "@/artifacts/energygrid-simulator.html?raw";

export type CourseArtifact = {
  /** Title shown in the modal header. */
  title: string;
  /** Label on the black launch button in the course view. */
  buttonLabel: string;
  /** Full standalone HTML document rendered inside the sandboxed iframe. */
  html: string;
  /**
   * Optional iframe sandbox override. Defaults to "allow-scripts allow-modals".
   * Deliberately never includes allow-same-origin, so an artifact can't reach
   * the app's origin, cookies, or localStorage (where the auth token lives).
   * Add "allow-downloads" for artifacts that export files.
   */
  sandbox?: string;
};

const artifacts: Record<string, CourseArtifact> = {
  "ai-automation-fundamentals": {
    title: "Flow Studio — Automation Whiteboard",
    buttonLabel: "Open the automation whiteboard",
    html: flowStudioHtml,
  },
  "cad-digital-manufacturing": {
    title: "EnergyGrid Simulator — Engineering Lab",
    buttonLabel: "Open the EnergyGrid simulator",
    html: energyGridHtml,
    // Export downloads a JSON of the design; modals power Clear/Report.
    sandbox: "allow-scripts allow-modals allow-downloads",
  },
};

export function getArtifact(slug: string | null | undefined): CourseArtifact | undefined {
  return slug ? artifacts[slug] : undefined;
}
