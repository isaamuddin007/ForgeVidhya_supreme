import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useSound } from "@/components/sound-provider";

/**
 * ChatbotBubble — a large glossy floating orb fixed to the right side of the
 * screen. Tapping it plays the "blub" pop and opens the Sarvam Indus chatbot
 * in a new tab. Present on every page via Layout.
 */
export function ChatbotBubble() {
  const { playBlub } = useSound();

  const open = () => {
    playBlub();
    window.open("https://indus.sarvam.ai", "_blank", "noopener,noreferrer");
  };

  return (
    <motion.button
      type="button"
      onClick={open}
      aria-label="Chat with our AI assistant"
      className="group fixed right-4 top-1/2 z-50 grid -translate-y-1/2 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:right-6"
      style={{ width: 88, height: 88 }}
      initial={{ opacity: 0, scale: 0, x: 40 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: ["-50%", "-56%", "-50%"] }}
      transition={{
        opacity: { delay: 0.4 },
        scale: { type: "spring", stiffness: 300, damping: 16, delay: 0.4 },
        x: { type: "spring", stiffness: 300, damping: 16, delay: 0.4 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
    >
      {/* pulsing glow */}
      <motion.span
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #00bfff, #0080bf, #ff9500)",
        }}
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.12, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* glass body */}
      <span
        className="relative grid h-[88px] w-[88px] place-items-center rounded-full border border-white/40 backdrop-blur-md"
        style={{
          background: "linear-gradient(150deg, #00bfffcc, #0080bfcc, #ff9500bb)",
          boxShadow:
            "inset 0 3px 8px rgba(255,255,255,0.55), 0 12px 32px rgba(0,191,255,0.35)",
        }}
      >
        {/* highlight shine */}
        <span className="absolute left-5 top-4 h-5 w-8 rounded-full bg-white/70 blur-[2px]" />
        <MessageCircle
          className="relative h-9 w-9 text-white drop-shadow"
          strokeWidth={2.4}
        />
        {/* online dot */}
        <span className="absolute right-3 top-3 h-3.5 w-3.5 rounded-full border-2 border-white bg-forge-orange" />
      </span>
      {/* label */}
      <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background opacity-0 shadow-forge transition-opacity group-hover:opacity-100">
        Ask AI
      </span>
    </motion.button>
  );
}
