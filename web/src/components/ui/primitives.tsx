import { type ComponentType } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icon — renders a lucide icon by name. Set `gradient` to wrap it in the
 * forge gradient (#99ceff -> #0033ff -> #ff0000) as a clickable accent tile.
 */
type IconProps = {
  name: string;
  className?: string;
  size?: number;
  gradient?: boolean;
};

export function Icon({ name, className, size = 24, gradient }: IconProps) {
  const Cmp = (Lucide as unknown as Record<
    string,
    ComponentType<{ className?: string; size?: number }>
  >)[name];
  if (!Cmp) return null;
  if (gradient) {
    return (
      <span
        className={cn(
          "inline-grid place-items-center rounded-xl bg-forge-gradient shadow-forge",
          className
        )}
      >
        <Cmp size={size} className="[&_path]:stroke-white" />
      </span>
    );
  }
  return <Cmp size={size} className={className} />;
}

/**
 * SectionHeading — consistent eyebrow + title + subtitle across pages.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <span className="inline-block rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * FadeIn — scroll-reveal wrapper using framer-motion.
 */
export function FadeIn({
  children,
  delay = 0,
  className,
  y = 20,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
