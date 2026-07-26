import { type ReactNode } from "react";
import { BubbleNav } from "@/components/BubbleNav";
import { ChatbotBubble } from "@/components/ChatbotBubble";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/SEO";

/**
 * Layout — shared shell wrapping every page with navbar, footer, scroll reset.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollToTop />
      <BubbleNav />
      <ChatbotBubble />
      <main className="flex-1 pt-40 sm:pt-44">{children}</main>
      <Footer />
    </div>
  );
}
