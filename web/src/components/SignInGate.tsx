import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Shield, Smartphone, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSound } from "@/components/sound-provider";

const GUEST_KEY = "ff-guest";

/**
 * SignInGate — the welcome overlay for visitors who aren't signed in.
 *
 * Primary sign-in is the mobile number + SMS one-time code. Email/password is
 * kept as a secondary option behind a toggle. Guests can browse without signing
 * in (the whole site is read-only for everyone except the admin).
 *
 * Roles: the backend grants 'admin' only to the allow-listed number; every other
 * number signs in as a read-only 'user'. When an admin is signed in, the account
 * chip gains a shortcut to the dashboard.
 */
export function SignInGate() {
  const {
    user,
    isLoading,
    isSigningIn,
    isAdmin,
    error,
    otpNotice,
    sendOtp,
    verifyOtp,
    loginWithPassword,
    register,
    signOut,
    clearError,
  } = useAuth();
  const { playBlub } = useSound();

  const [guest, setGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"number" | "code">("number");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const digits = phone.replace(/\D/g, "");

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    playBlub();
    if (digits.length < 10) return;
    const ok = await sendOtp(digits);
    if (ok) {
      setStep("code");
      setSent(true);
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    playBlub();
    if (code.trim().length !== 6) return;
    await verifyOtp(digits, code.trim());
    // On success the user is set and the gate closes; on failure `error` shows.
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    playBlub();
    if (mode === "register") await register(name, email, password);
    else await loginWithPassword(email, password);
  };

  const continueAsGuest = () => {
    playBlub();
    setGuest(true);
    try {
      localStorage.setItem(GUEST_KEY, "1");
    } catch {
      // ignore storage errors
    }
  };

  const showGate = !isLoading && !user && !guest;
  const inputCls =
    "glass-input h-11 w-full rounded-xl px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

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
              className="glass-panel relative w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center"
              initial={{ y: 32, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            >
              <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-forge-gradient opacity-25 blur-3xl" />

              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-forge-gradient text-white shadow-forge">
                <Sparkles className="h-7 w-7" />
              </span>

              <h2 className="font-display text-2xl font-bold tracking-tight">
                Welcome to <span className="text-forge-gradient">forgeVidhya</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {method === "phone"
                  ? "Sign in with your mobile number."
                  : "Sign in to save your progress."}
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
                {method === "phone" ? (
                  step === "number" ? (
                    <form onSubmit={submitPhone} className="flex flex-col gap-2.5 text-left">
                      <label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                        Mobile number
                      </label>
                      <div className="glass-input flex overflow-hidden rounded-xl focus-within:ring-2 focus-within:ring-primary/40">
                        <span className="grid place-items-center border-r border-border bg-secondary/60 px-3 text-sm font-medium text-muted-foreground">
                          +91
                        </span>
                        <input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="10-digit number"
                          className="h-11 flex-1 bg-transparent px-3.5 text-sm outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSigningIn || digits.length < 10}
                        className="h-11 rounded-xl bg-forge-gradient font-semibold text-white shadow-forge transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                      >
                        {isSigningIn ? "Sending code…" : "Send code"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={submitCode} className="flex flex-col gap-2.5 text-left">
                      <label htmlFor="code" className="text-xs font-medium text-muted-foreground">
                        Enter the 6-digit code sent to +91 {digits}
                      </label>
                      <input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="••••••"
                        className={`${inputCls} text-center font-mono text-lg tracking-[0.4em]`}
                      />
                      <button
                        type="submit"
                        disabled={isSigningIn || code.length !== 6}
                        className="h-11 rounded-xl bg-forge-gradient font-semibold text-white shadow-forge transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                      >
                        {isSigningIn ? "Verifying…" : "Verify & sign in"}
                      </button>
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            clearError();
                            setStep("number");
                            setCode("");
                          }}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          ← Change number
                        </button>
                        <button
                          type="button"
                          disabled={isSigningIn}
                          onClick={() => {
                            clearError();
                            void sendOtp(digits);
                          }}
                          className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
                        >
                          Resend code
                        </button>
                      </div>
                      {otpNotice ? (
                        <p className="rounded-lg bg-forge-orange/10 px-3 py-2 text-[11px] leading-snug text-forge-orange">
                          {otpNotice}
                        </p>
                      ) : (
                        sent && (
                          <p className="text-[11px] leading-snug text-muted-foreground">
                            The code expires in 10 minutes.
                          </p>
                        )
                      )}
                    </form>
                  )
                ) : (
                  <form onSubmit={submitCredentials} className="flex flex-col gap-2.5 text-left">
                    {mode === "register" && (
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        autoComplete="name"
                        className={inputCls}
                      />
                    )}
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      autoComplete="email"
                      className={inputCls}
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      autoComplete={mode === "register" ? "new-password" : "current-password"}
                      className={inputCls}
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
                  </form>
                )}

                {/* switch method */}
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setMethod((m) => (m === "phone" ? "email" : "phone"));
                    setStep("number");
                    setCode("");
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {method === "phone" ? (
                    "Use email instead"
                  ) : (
                    <>
                      <Smartphone className="h-3.5 w-3.5" /> Use mobile number instead
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={continueAsGuest}
                  className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
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
          <span className="grid h-7 w-7 place-items-center rounded-full bg-forge-gradient text-[11px] font-bold text-white">
            {(user.name ?? user.phone ?? user.email ?? "?").replace(/^\+/, "").charAt(0).toUpperCase()}
          </span>
          <span className="max-w-[130px] truncate text-xs font-semibold">
            {user.name ?? user.phone ?? user.email}
          </span>

          {isAdmin && (
            <Link
              to="/admin"
              aria-label="Admin dashboard"
              title="Admin dashboard"
              className="grid h-6 w-6 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10"
            >
              <Shield className="h-3.5 w-3.5" />
            </Link>
          )}

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
