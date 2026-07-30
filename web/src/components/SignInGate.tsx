import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSound } from "@/components/sound-provider";

const GUEST_KEY = "ff-guest";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M16.36 12.79c-.03-2.53 2.07-3.74 2.16-3.8-1.18-1.72-3.01-1.96-3.66-1.99-1.56-.16-3.04.92-3.83.92-.79 0-2.01-.9-3.3-.87-1.7.03-3.27.99-4.14 2.5-1.77 3.07-.45 7.6 1.27 10.09.84 1.22 1.84 2.59 3.16 2.54 1.27-.05 1.75-.82 3.28-.82 1.53 0 1.96.82 3.3.79 1.36-.02 2.22-1.24 3.05-2.46.96-1.41 1.36-2.78 1.38-2.85-.03-.01-2.64-1.01-2.67-4.05ZM13.84 5.35c.7-.85 1.17-2.02 1.04-3.2-1 .04-2.23.67-2.95 1.51-.65.75-1.22 1.96-1.06 3.11 1.12.09 2.27-.57 2.97-1.42Z" />
    </svg>
  );
}

/**
 * SignInGate — a branded welcome overlay shown at the start of the site for
 * visitors who aren't signed in. Offers Google and Apple sign-in, or browsing
 * as a guest. When signed in, shows a small account chip with sign-out.
 */
export function SignInGate() {
  const {
    user,
    isLoading,
    isSigningIn,
    error,
    signIn,
    loginWithPassword,
    register,
    signOut,
    clearError,
  } = useAuth();
  const { playBlub } = useSound();
  const location = useLocation();
  const [guest, setGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    playBlub();
    if (mode === "register") await register(name, email, password);
    else await loginWithPassword(email, password);
    // On success the user becomes set and the gate closes; on failure the
    // context `error` renders above the form.
  };

  // Never block the OAuth landing route.
  if (location.pathname === "/auth/callback") return null;

  const continueAsGuest = () => {
    playBlub();
    setGuest(true);
    try {
      localStorage.setItem(GUEST_KEY, "1");
    } catch {
      // ignore storage errors
    }
  };

  const handleSignIn = (provider: "google" | "apple") => {
    playBlub();
    void signIn(provider);
  };

  const showGate = !isLoading && !user && !guest;

  return (
    <>
      <AnimatePresence>
        {showGate && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-card p-8 text-center shadow-forge"
              initial={{ y: 32, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            >
              {/* brand glow */}
              <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-forge-gradient opacity-25 blur-3xl" />

              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge">
                <Sparkles className="h-7 w-7" />
              </span>

              <h2 className="font-display text-2xl font-bold tracking-tight">
                Welcome to{" "}
                <span className="text-forge-gradient">forgeVidhya</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to save your progress and unlock more as we add
                integrations.
              </p>

              {error && (
                <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-forge-red/10 px-3 py-2 text-left text-xs font-medium text-forge-red">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={clearError}
                    aria-label="Dismiss error"
                    className="shrink-0 rounded-full p-1 hover:bg-forge-red/15"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleSignIn("google")}
                  disabled={isSigningIn}
                  className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-border bg-background font-semibold shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  <GoogleMark />
                  {isSigningIn ? "Opening Google…" : "Sign in with Google"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSignIn("apple")}
                  disabled={isSigningIn}
                  className="flex h-12 items-center justify-center gap-3 rounded-2xl bg-foreground font-semibold text-background shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  <AppleMark />
                  Sign in with Apple
                </button>

                {/* divider */}
                <div className="my-1 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>

                {/* email / password */}
                <form onSubmit={submitCredentials} className="flex flex-col gap-2.5 text-left">
                  {mode === "register" && (
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      autoComplete="name"
                      className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  )}
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                  {mode === "register" && (
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      8+ characters with upper, lower, a number, and a symbol.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="h-11 rounded-xl bg-forge-gradient font-semibold text-white shadow-forge transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  >
                    {isSigningIn
                      ? "Please wait…"
                      : mode === "register"
                        ? "Create account"
                        : "Sign in"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setMode((m) => (m === "signin" ? "register" : "signin"));
                  }}
                  className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline"
                >
                  {mode === "signin"
                    ? "New here? Create an account"
                    : "Have an account? Sign in"}
                </button>

                <button
                  type="button"
                  onClick={continueAsGuest}
                  className="mt-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Continue as guest
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* signed-in account chip */}
      {user && (
        <motion.div
          className="fixed bottom-4 left-4 z-[60] flex items-center gap-2 rounded-full border border-border/60 bg-card/90 py-1.5 pl-1.5 pr-3 shadow-lg backdrop-blur"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name ?? user.email}
              className="h-7 w-7 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-forge-gradient text-[11px] font-bold text-white">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </span>
          )}
          <span className="max-w-[120px] truncate text-xs font-semibold">
            {user.name ?? user.email}
          </span>
          <button
            type="button"
            onClick={() => {
              playBlub();
              signOut();
            }}
            aria-label="Sign out"
            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </>
  );
}
