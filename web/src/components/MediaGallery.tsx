import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  UploadCloud,
  ImagePlus,
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useGallery } from "@/components/gallery-provider";
import { useSound } from "@/components/sound-provider";
import { cn } from "@/lib/utils";

/**
 * MediaGallery — a vanity showcase where visitors upload images and videos that
 * play back as an auto-advancing, seamless crossfade + Ken-Burns slideshow.
 * Includes an upload dropzone, thumbnail strip, and playback controls.
 */
export function MediaGallery() {
  const { items, error, addFiles, removeItem, clearAll } = useGallery();
  const { playBlub } = useSound();

  const [index, setIndex] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [dragging, setDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = items.length;
  const safeIndex = count > 0 ? index % count : 0;
  const current = items[safeIndex];

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count === 0) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count]
  );

  const goTo = useCallback((i: number) => {
    setIndex(i);
  }, []);

  // Auto-advance images on a timer; videos advance when they end.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!playing || count <= 1 || !current) return;
    if (current.type === "image") {
      timerRef.current = setTimeout(() => go(1), 4200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, count, current, safeIndex, go]);

  const onPick = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      playBlub();
      await addFiles(files);
    },
    [addFiles, playBlub]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      void onPick(e.dataTransfer.files);
    },
    [onPick]
  );

  return (
    <div className="rounded-3xl border border-border/60 glass-card p-4 shadow-forge sm:p-6">
      {/* ---------- Stage ---------- */}
      <div className="relative overflow-hidden rounded-2xl bg-black/80 aspect-video">
        {/* animated ambient gradient behind media */}
        <div className="pointer-events-none absolute inset-0 -z-0 bg-forge-gradient opacity-30 blur-2xl" />

        <AnimatePresence mode="popLayout">
          {current ? (
            <motion.div
              key={current.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
              transition={{
                opacity: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                filter: { duration: 0.8 },
              }}
            >
              {current.type === "image" ? (
                <motion.img
                  src={current.url}
                  alt={current.name}
                  className="h-full w-full object-cover"
                  // Slow Ken-Burns drift for vivid life.
                  initial={{ scale: 1.12 }}
                  animate={{ scale: 1.0 }}
                  transition={{ duration: 6, ease: "linear" }}
                  draggable={false}
                />
              ) : (
                <video
                  key={current.id}
                  src={current.url}
                  className="h-full w-full object-cover"
                  autoPlay={playing}
                  muted
                  playsInline
                  controls={false}
                  onEnded={() => go(1)}
                />
              )}
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "absolute inset-0 grid place-items-center text-center transition-colors",
                dragging ? "bg-primary/20" : "bg-transparent"
              )}
            >
              <div className="pointer-events-none flex flex-col items-center gap-3 px-6 text-white">
                <motion.span
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur"
                >
                  <UploadCloud className="h-8 w-8" />
                </motion.span>
                <p className="font-display text-lg font-bold">
                  Drop images & videos here
                </p>
                <p className="max-w-xs text-sm text-white/70">
                  Build a living showcase — your media plays back with seamless,
                  cinematic transitions.
                </p>
              </div>
            </button>
          )}
        </AnimatePresence>

        {/* caption + counter */}
        {current && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="truncate rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {current.name}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {safeIndex + 1} / {count}
            </span>
          </div>
        )}

        {/* prev / next */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                playBlub();
                go(-1);
              }}
              aria-label="Previous"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                playBlub();
                go(1);
              }}
              aria-label="Next"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 active:scale-90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* play / pause */}
        {count > 1 && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 active:scale-90"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* ---------- Controls ---------- */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            playBlub();
            inputRef.current?.click();
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-forge-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-forge transition-transform hover:scale-105 active:scale-95"
        >
          <ImagePlus className="h-4 w-4" />
          Add media
        </button>
        {count > 0 && (
          <button
            type="button"
            onClick={() => {
              playBlub();
              clearAll();
              setIndex(0);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        )}
        <span className="text-xs text-muted-foreground">
          Images & videos · up to 12MB each · stays on your device
        </span>
      </div>

      {error && (
        <p className="mt-2 text-sm font-medium text-forge-red">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void onPick(e.target.files);
          e.target.value = "";
        }}
      />

      {/* ---------- Thumbnails ---------- */}
      {count > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <div key={item.id} className="group relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  playBlub();
                  goTo(i);
                }}
                className={cn(
                  "relative h-16 w-24 overflow-hidden rounded-lg border-2 transition-all",
                  i === safeIndex
                    ? "border-primary shadow-forge"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <>
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                    <span className="absolute inset-0 grid place-items-center bg-black/30">
                      <Play className="h-4 w-4 text-white" fill="currentColor" />
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  removeItem(item.id);
                  setIndex(0);
                }}
                aria-label="Remove"
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-forge-red text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
