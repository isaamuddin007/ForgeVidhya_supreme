import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  GraduationCap,
  Wrench,
  BookOpen,
  Newspaper,
  LayoutGrid,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { buildSearchIndex, searchGroupOrder, type SearchEntry } from "@/lib/search";
import { useSound } from "@/components/sound-provider";

const groupIcons: Record<string, typeof Search> = {
  Pages: FileText,
  "AI Tracks": GraduationCap,
  "Engineering Fields": Wrench,
  Topics: BookOpen,
  Sections: LayoutGrid,
  "Blog Posts": Newspaper,
};

/**
 * Scrolls to an element by hash, retrying while the page/reveal animates in.
 */
export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id || id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  let attempts = 0;
  const tryScroll = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (attempts < 25) {
      attempts += 1;
      window.setTimeout(tryScroll, 120);
    }
  };
  tryScroll();
}

/** Scrolls to the hash target (or top) on every route change. */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      scrollToHash(hash);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, hash]);
  return null;
}

/**
 * SiteSearch — a command-palette search that navigates the entire website
 * precisely: pages, courses, engineering fields, individual topics, blog
 * posts, and page sections (deep-linked via anchors). Opens with the search
 * orb or Ctrl/Cmd+K.
 */
export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const { playBlub } = useSound();

  const index = useMemo(() => buildSearchIndex(), []);
  const grouped = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const g of searchGroupOrder) map.set(g, []);
    for (const e of index) {
      const list = map.get(e.group) ?? [];
      list.push(e);
      map.set(e.group, list);
    }
    return map;
  }, [index]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = useCallback(
    (entry: SearchEntry) => {
      playBlub();
      setOpen(false);
      const [targetPath, targetHash] = entry.path.split("#");
      const current = `${pathname}${hash}`;
      if (entry.path === current || (targetPath === pathname && targetHash && hash === `#${targetHash}`)) {
        // Already there — just scroll again.
        scrollToHash(targetHash ? `#${targetHash}` : "");
        return;
      }
      navigate(entry.path);
      if (targetHash) {
        // Give the new page a beat to mount, then scroll precisely.
        window.setTimeout(() => scrollToHash(`#${targetHash}`), 80);
      }
    },
    [navigate, pathname, hash, playBlub]
  );

  return (
    <>
      <motion.button
        type="button"
        onClick={() => {
          playBlub();
          setOpen(true);
        }}
        aria-label="Search the site"
        className="flex h-11 items-center gap-2 rounded-full glass-card px-3 text-foreground shadow-forge outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:px-4"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
      >
        <Search className="h-5 w-5" />
        <span className="hidden text-sm text-muted-foreground md:inline">
          Search
        </span>
        <kbd className="hidden rounded-md border border-border/60 bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground md:inline">
          ⌘K
        </kbd>
      </motion.button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search courses, topics, sections, blog posts…" />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>No results. Try a course name or a topic.</CommandEmpty>
          {searchGroupOrder.map((group) => {
            const items = grouped.get(group) ?? [];
            if (items.length === 0) return null;
            const GIcon = groupIcons[group] ?? Search;
            return (
              <CommandGroup key={group} heading={group}>
                {items.map((entry) => (
                  <CommandItem
                    key={entry.id}
                    value={`${entry.label} ${entry.keywords}`}
                    onSelect={() => go(entry)}
                    className="cursor-pointer gap-3"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forge-gradient/10 text-primary">
                      <GIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {entry.label}
                      </span>
                      {entry.description && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {entry.description}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
