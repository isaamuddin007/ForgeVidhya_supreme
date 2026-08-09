import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  Send,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { FadeIn, SectionHeading } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site";
import { submitContact } from "@/lib/backend";

const socials = [
  { Icon: Twitter, href: siteConfig.social.twitter, label: "Twitter" },
  { Icon: Linkedin, href: siteConfig.social.linkedin, label: "LinkedIn" },
  { Icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
  { Icon: Youtube, href: siteConfig.social.youtube, label: "YouTube" },
  { Icon: Github, href: siteConfig.social.github, label: "GitHub" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    branch: "",
    message: "",
  });

  const update = (k: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const { toast } = await import("sonner");
    try {
      await submitContact(form);
      setSubmitted(true);
      toast.success("Thanks! We'll reply within 24 hours.");
    } catch (err) {
      console.error("contact submit failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Couldn't send your message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Contact Us"
        description="Apply to forgeVidhya, ask about a program, or just say hello. We reply to every message within 24 hours."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-forge-radial" />
        <div className="absolute inset-0 -z-10 grid-backdrop opacity-50" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <FadeIn>
            <span className="inline-block rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Contact
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Let's forge
              <span className="text-forge-gradient"> something together.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Applying to a cohort, asking about a program, or partnering with
              us to hire? Tell us your name, your college, and what you'd build
              if no one was watching.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {/* Contact info */}
          <FadeIn>
            <div className="space-y-6">
              <div className="rounded-2xl glass-card p-6">
                <h2 className="font-display text-lg font-bold">
                  Reach us directly
                </h2>
                <ul className="mt-4 space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="font-medium hover:text-primary"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                      <Phone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                        className="font-medium hover:text-primary"
                      >
                        {siteConfig.phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <a
                        href={siteConfig.location.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary"
                      >
                        {siteConfig.address}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-surface-gradient p-6 shadow-forge">
                <h2 className="font-display text-lg font-bold text-secondary-foreground">
                  Follow the forge
                </h2>
                <p className="mt-1 text-sm text-secondary-foreground/80">
                  We post student builds and free tutorials daily.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-10 w-10 place-items-center rounded-lg bg-card/80 text-secondary-foreground backdrop-blur transition-all hover:scale-110 hover:text-foreground hover:shadow-forge"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl glass-card p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-forge-gradient text-white shadow-forge">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium">
                    Cohort #4 admissions close soon.
                  </p>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  The foundational AI Automation track is free, always. Paid
                  mentor-led tracks have limited seats for real 1:1 attention.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.1}>
            <div className="rounded-3xl glass-card p-7 sm:p-9">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full flex-col items-center justify-center py-16 text-center"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-forge-gradient text-white shadow-forge">
                    <CheckCircle2 className="h-8 w-8" />
                  </span>
                  <h2 className="mt-6 font-display text-2xl font-bold">
                    Message received.
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Thanks, {form.name.split(" ")[0] || "friend"}. A real human
                    from the forgeVidhya team will reply to{" "}
                    <span className="font-medium text-foreground">
                      {form.email}
                    </span>{" "}
                    within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        college: "",
                        branch: "",
                        message: "",
                      });
                    }}
                    className="mt-6 text-sm font-semibold text-primary hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Name"
                      id="name"
                      required
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Your full name"
                    />
                    <Field
                      label="Email"
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@college.edu"
                    />
                    <Field
                      label="College"
                      id="college"
                      required
                      value={form.college}
                      onChange={update("college")}
                      placeholder="Your college name"
                    />
                    <Field
                      label="Branch / year"
                      id="branch"
                      value={form.branch}
                      onChange={update("branch")}
                      placeholder="e.g. ECE, 1st year"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium"
                    >
                      What would you build if no one was watching?
                      <span className="text-forge-red"> *</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => update("message")(e.target.value)}
                      placeholder="Tell us about an idea you'd love to ship — even if it sounds small."
                      className="mt-2 w-full rounded-xl glass-input px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forge-gradient px-6 py-3.5 text-base font-semibold text-white shadow-forge transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Send application"} <Send className="h-4 w-4" />
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    By submitting, you agree to our{" "}
                    <a href="/privacy" className="underline hover:text-foreground">
                      Privacy Policy
                    </a>
                    . We never share your data.
                  </p>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </section>
    </Layout>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span className="text-forge-red"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl glass-input px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
