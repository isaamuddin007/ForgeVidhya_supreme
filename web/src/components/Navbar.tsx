import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sun, Moon, Zap } from "lucide-react";
import { useState } from "react";
import { navItems, siteConfig } from "@/lib/site";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Navbar — sticky, smooth-scroll-aware, with mobile drawer and dark-mode toggle.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { theme, toggleTheme, mounted } = useTheme();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className={cn(
            "mt-3 flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300",
            "glass-card shadow-forge"
          )}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5"
            aria-label={`${siteConfig.name} home`}
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-forge-gradient shadow-forge">
              <Zap className="h-5 w-5 text-white" fill="white" />
              <span className="absolute inset-0 rounded-xl bg-forge-gradient opacity-50 blur-md transition-opacity group-hover:opacity-80" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              forge
              <span className="text-forge-gradient-static">Vidhya</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-secondary/80"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-card/50 text-foreground transition-colors hover:bg-secondary"
              aria-label="Toggle dark mode"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Link
              to="/contact"
              className="hidden rounded-lg bg-forge-gradient px-4 py-2 text-sm font-semibold text-white shadow-forge transition-transform hover:scale-[1.03] active:scale-95 sm:block"
            >
              Join the cohort
            </Link>

            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-card/50 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl glass-card p-4 shadow-forge md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg bg-forge-gradient px-4 py-3 text-center text-sm font-semibold text-white shadow-forge"
                >
                  Join the cohort
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </header>
  );
}
