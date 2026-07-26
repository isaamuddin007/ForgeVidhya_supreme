import { useEffect, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";

/**
 * ThemeProvider — controls light/dark mode with persistence.
 * Respects system preference on first visit, then stores user choice.
 */
type Theme = "light" | "dark";

const [ThemeProviderHook, useTheme] = createContextHook(() => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ff-theme") as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ff-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return { theme, toggleTheme, mounted };
});

export const ThemeProvider = ThemeProviderHook;
export { useTheme };
