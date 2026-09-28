import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SoundProvider } from "@/components/sound-provider";
import { GalleryProvider } from "@/components/gallery-provider";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import { SignInGate } from "@/components/SignInGate";
import AuroraBackground from "@/components/AuroraBackground";
import MagicCursor from "@/components/MagicCursor";
import MagicBoxFx from "@/components/MagicBoxFx";
import { ScrollToHash } from "@/components/SiteSearch";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider>
        <SoundProvider>
        <GalleryProvider>
        <TooltipProvider>
          <MagicCursor />
          <MagicBoxFx />
          <Toaster position="top-center" />
          {/* The background wraps the site rather than sitting beside it:
              its stage is z-index 0 and its content slot z-index 1, so a
              bare sibling would paint over the page. Mounted outside
              <Routes> so it survives navigation — each page renders its own
              Layout, which would otherwise remount it. */}
          <AuroraBackground>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <SignInGate />
            <ScrollToHash />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              {/* Admin-only; the page itself gates on role, and every admin API
                  it calls is guarded server-side by authorize('admin'). */}
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </AuroraBackground>
        </TooltipProvider>
        </GalleryProvider>
        </SoundProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
