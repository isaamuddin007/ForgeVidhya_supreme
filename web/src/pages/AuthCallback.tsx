import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * OAuth landing route. The backend redirects here after Google sign-in with
 * `?token=<jwt>` on success, or `?error=<code>` on failure. We store the token
 * (via login) and return home.
 */
export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const ran = useRef<boolean>(false);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const err = params.get("error");

    if (err) {
      setFailed("Google sign-in failed. Please try again.");
      const t = setTimeout(() => navigate("/", { replace: true }), 2000);
      return () => clearTimeout(t);
    }
    if (token) {
      login(token);
    }
    navigate("/", { replace: true });
  }, [login, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-3">
        {failed ? (
          <p className="text-sm font-medium text-destructive">{failed}</p>
        ) : (
          <>
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  );
}
