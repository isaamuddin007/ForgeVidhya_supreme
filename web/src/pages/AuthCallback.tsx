import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Production OAuth landing route. Rork redirects here with `?code=...` after a
 * top-level sign-in redirect; we exchange the code and return home.
 */
export default function AuthCallback() {
  const { exchangeCode } = useAuth();
  const navigate = useNavigate();
  const ran = useRef<boolean>(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      navigate("/", { replace: true });
      return;
    }
    void exchangeCode(code).finally(() => navigate("/", { replace: true }));
  }, [exchangeCode, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
