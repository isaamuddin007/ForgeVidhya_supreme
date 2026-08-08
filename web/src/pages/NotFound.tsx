import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Zap } from "lucide-react";
import { SEO } from "@/components/SEO";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <SEO title="Page not found" noindex />
      <div className="absolute inset-0 -z-10 bg-forge-radial" />
      <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge">
          <Zap className="h-8 w-8" fill="white" />
        </span>
        <p className="mt-8 font-display text-7xl font-bold text-forge-gradient sm:text-9xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          This page slipped into the forge.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          The link may be broken, or the page may have moved. Let's get you back
          to building.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton to="/" size="lg">
            <Home className="h-4 w-4" /> Back home
          </LinkButton>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-xl glass-soft px-6 py-3.5 text-base font-semibold transition-colors hover:border-primary hover:bg-secondary/50"
          >
            <ArrowLeft className="h-4 w-4" /> Read the blog
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
