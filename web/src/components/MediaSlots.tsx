import { useCallback, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Plus, X, Play } from "lucide-react";
import { useGallery, type MediaSlot } from "@/components/gallery-provider";
import { useSound } from "@/components/sound-provider";
import { cn } from "@/lib/utils";

/**
 * MediaSlots — a grid of predefined empty spaces with fixed dimensions that
 * visitors fill with a single image or video each. Empty slots show a dashed
 * frame with the slot label and target size; filled slots show the media with
 * a seamless fade-in and a remove control.
 */
export function MediaSlots() {
  const { slots, error } = useGallery();

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-sm font-medium text-forge-red">{error}</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Each frame holds one image or video · up to 12MB · stays on your device
      </p>
    </div>
  );
}

function SlotCard({ slot }: { slot: MediaSlot }) {
  const { setSlotFile, clearSlot } = useGallery();
  const { playBlub } = useSound();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);

  // Pointer-tracking parallax tilt — confined to this card's own area.
  const px = useMotionValue<number>(0);
  const py = useMotionValue<number>(0);
  const sx = useSpring(px, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 220, damping: 18, mass: 0.4 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width - 0.5);
      py.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [px, py]
  );

  const handleLeave = useCallback(() => {
    px.set(0);
    py.set(0);
  }, [px, py]);

  const pick = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      playBlub();
      void setSlotFile(slot.id, file);
    },
    [playBlub, setSlotFile, slot.id]
  );

  const media = slot.media;

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 [transform-style:preserve-3d]"
      style={{ aspectRatio: slot.ratio, rotateX, rotateY, perspective: 800 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {media ? (
        <>
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={media.name}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <video
                src={media.url}
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            )}
          </motion.div>

          {media.type === "video" && (
            <span className="pointer-events-none absolute bottom-2 left-2 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white backdrop-blur">
              <Play className="h-3 w-3" fill="currentColor" />
            </span>
          )}

          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            {slot.label}
          </span>

          <button
            type="button"
            onClick={() => {
              playBlub();
              clearSlot(slot.id);
            }}
            aria-label={`Remove ${slot.label}`}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-forge-red text-white opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files);
          }}
          className={cn(
            "absolute inset-0 grid place-items-center rounded-2xl border-2 border-dashed transition-colors",
            dragging
              ? "border-primary bg-primary/10"
              : "border-border/70 hover:border-primary/60 hover:bg-secondary/40"
          )}
        >
          <div className="flex flex-col items-center gap-2 px-2 text-center">
            <motion.span
              animate={{ scale: dragging ? 1.15 : 1 }}
              className="grid h-10 w-10 place-items-center rounded-xl bg-forge-gradient text-white shadow-forge"
            >
              <Plus className="h-5 w-5" />
            </motion.span>
            <span className="text-xs font-semibold text-foreground">
              {slot.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {slot.hint}
            </span>
          </div>
        </button>
      )}

      {/* pointer glare that follows the cursor across the square */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            glareX,
            (x) =>
              `radial-gradient(circle at ${x} 30%, rgba(255,255,255,0.25), transparent 55%)`
          ),
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </motion.div>
  );
}
