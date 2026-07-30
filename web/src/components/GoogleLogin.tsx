import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/** Google's multi-colour "G" mark. */
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

/**
 * GoogleLogin — a Google-branded sign-in button (white background, colour mark).
 * On click it redirects to the backend's /auth/google endpoint via useAuth().
 *
 * Usage: <GoogleLogin />  (optionally pass a className to size/position it).
 */
export function GoogleLogin({ className }: { className?: string }) {
  const { signIn, isSigningIn } = useAuth();

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      disabled={isSigningIn}
      aria-label="Sign in with Google"
      className={cn(
        "flex h-12 items-center justify-center gap-3 rounded-2xl border border-border bg-white px-5 font-semibold text-neutral-800 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      <GoogleMark />
      {isSigningIn ? "Opening Google…" : "Sign in with Google"}
    </button>
  );
}

export default GoogleLogin;
