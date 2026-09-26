import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight, Sparkles, Wrench, X } from "lucide-react";
import { FadeIn } from "@/components/ui/primitives";
import { useSound } from "@/components/sound-provider";
import { ArtifactModal } from "@/components/ArtifactModal";
import { getArtifact } from "@/lib/artifacts";
import type { Block, Course, CourseTopic } from "@/lib/courses";
import { cn } from "@/lib/utils";

/**
 * CourseView — the interactive knowledge base for one course.
 *
 * Chapters (modules) are listed with their sub-section topics rendered as
 * clickable rows. Clicking a topic opens an in-site "screen" (TopicScreen)
 * that displays that subtopic's knowledge — no page navigation, no boring
 * scroll-through of the whole handbook at once.
 */
export function CourseView({
  course,
  backHref,
  backLabel,
}: {
  course: Course;
  backHref: string;
  backLabel: string;
}) {
  const { playBlub } = useSound();
  const [openId, setOpenId] = useState<string | null>(null);
  const [artifactOpen, setArtifactOpen] = useState(false);
  const artifact = getArtifact(course.slug);

  // Flattened topic order for prev/next navigation inside the screen.
  const flat = useMemo(
    () => course.modules.flatMap((m) => m.topics),
    [course]
  );
  const openIndex = flat.findIndex((t) => t.id === openId);
  const openTopic = openIndex >= 0 ? flat[openIndex] : null;

  const open = (id: string) => {
    playBlub();
    setOpenId(id);
  };

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <FadeIn>
            <Link
              to={backHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {backLabel}
            </Link>
            <span className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Knowledge base
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {course.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {course.tagline}
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              {course.modules.length} chapters · {flat.length} topics — tap any topic to open it
            </p>

            {/* hands-on artifact — a small black launch button (only when the
                course ships one). Opens a full-frame tool over the site. */}
            {artifact && (
              <button
                type="button"
                onClick={() => {
                  playBlub();
                  setArtifactOpen(true);
                }}
                className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg bg-[#d7b460] px-4 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10 transition-transform hover:scale-[1.03] hover:bg-[#35343d] active:scale-95"
              >
                <Wrench className="h-4 w-4" />
                {artifact.buttonLabel}
              </button>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Chapters + topics */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {course.modules.map((m, mi) => (
            <FadeIn key={m.number} delay={Math.min(mi, 4) * 0.04}>
              <div>
                {/* chapter header */}
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forge-gradient text-sm font-bold text-white shadow-forge">
                    {m.number}
                  </span>
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    {m.title}
                  </h2>
                </div>

                {/* chapter intro (short lead-in prose before the first topic) */}
                {(() => {
                  const lead = m.intro.filter(isProse).slice(0, 2);
                  return lead.length > 0 ? (
                    <div className="mt-3 space-y-2 border-l-2 border-border/60 pl-4 text-sm leading-relaxed text-muted-foreground">
                      {lead.map((b, i) => (
                        <p key={i}>{b.text}</p>
                      ))}
                    </div>
                  ) : null;
                })()}

                {/* topic rows — the clickable "subtitles" */}
                <ul className="mt-5 space-y-2.5">
                  {m.topics.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => open(t.id)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-border/60 glass-soft px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/60 hover:shadow-forge"
                      >
                        <span className="font-mono text-xs font-semibold text-primary">
                          {t.number}
                        </span>
                        <span className="flex-1 font-semibold leading-snug text-foreground">
                          {t.title}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* In-site subtopic screen */}
      <TopicScreen
        topic={openTopic}
        hasPrev={openIndex > 0}
        hasNext={openIndex >= 0 && openIndex < flat.length - 1}
        onPrev={() => openIndex > 0 && open(flat[openIndex - 1].id)}
        onNext={() =>
          openIndex >= 0 &&
          openIndex < flat.length - 1 &&
          open(flat[openIndex + 1].id)
        }
        onClose={() => setOpenId(null)}
      />

      {/* Full-frame hands-on artifact */}
      <ArtifactModal
        artifact={artifact ?? null}
        open={artifactOpen}
        onClose={() => setArtifactOpen(false)}
      />
    </>
  );
}

/**
 * TopicScreen — the in-site panel that shows one subtopic's knowledge.
 */
function TopicScreen({
  topic,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: {
  topic: CourseTopic | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const openState = topic !== null;

  useEffect(() => {
    if (!openState) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && hasNext) onNext();
      else if (e.key === "ArrowLeft" && hasPrev) onPrev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openState, hasNext, hasPrev, onNext, onPrev, onClose]);

  return (
    <AnimatePresence>
      {topic && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-stretch justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={topic.title}
        >
          {/* backdrop */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-background/70 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* panel */}
          <motion.div
            key={topic.id}
            className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden glass-panel sm:h-auto sm:max-h-[86vh] sm:rounded-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* sticky header */}
            <div className="flex items-start gap-3 border-b border-border/60 glass-bar px-5 py-4 backdrop-blur sm:px-7">
              <span className="mt-0.5 font-mono text-xs font-semibold text-primary">
                {topic.number}
              </span>
              <h2 className="flex-1 font-display text-xl font-bold leading-snug sm:text-2xl">
                {topic.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* scrollable body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
              {topic.blocks.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
            </div>

            {/* footer nav */}
            <div className="flex items-center justify-between gap-3 border-t border-border/60 glass-bar px-5 py-3 backdrop-blur sm:px-7">
              <button
                type="button"
                onClick={onPrev}
                disabled={!hasPrev}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors enabled:hover:bg-secondary enabled:hover:text-foreground disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors enabled:hover:bg-secondary enabled:hover:text-foreground disabled:opacity-40"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A prose paragraph worth showing as a chapter lead-in (not a diagram/table fragment). */
function isProse(b: Block): boolean {
  if (b.type !== "p") return false;
  if (/[┌┐└┘─│▼▲►◄]/.test(b.text)) return false; // diagram fragment
  const letters = (b.text.match(/[A-Za-z]/g) || []).length;
  return letters >= 20 && letters / b.text.length > 0.4;
}

/** Renders a single content block: prose, a "Try this now" callout, or a table/diagram. */
function BlockView({ block }: { block: Block }) {
  if (block.type === "pre") {
    return (
      <pre className="overflow-x-auto rounded-xl border border-border/60 bg-secondary/40 p-4 font-mono text-xs leading-relaxed text-foreground/90">
        {block.text}
      </pre>
    );
  }
  const isCallout = /^(TRY THIS NOW|TASK|EXERCISE)\b/i.test(block.text);
  return (
    <p
      className={cn(
        "leading-relaxed text-foreground/90",
        isCallout &&
          "rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 font-medium text-foreground"
      )}
    >
      {block.text}
    </p>
  );
}
