import { type ReactNode } from "react";
import { BubbleNav } from "@/components/BubbleNav";
import { Footer } from "@/components/Footer";
import { NotebookButton } from "@/components/NotebookButton";
import { ScrollToTop } from "@/components/SEO";

/**
 * Layout — shared shell wrapping every page with navbar, footer, scroll reset.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollToTop />
      <BubbleNav />
      {/* No large top padding: BubbleNav sits in normal flow above this, so the
          page no longer has to reserve space for a fixed header. */}
      <main className="flex-1 pt-4 sm:pt-6">{children}</main>
      <Footer />
      <NotebookButton />
    </div>
  );
}
