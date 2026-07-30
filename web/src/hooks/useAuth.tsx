import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Auth context — global authentication state, backed by the forgeVidhya API's
 * Google OAuth flow.
 *
 * Flow: signIn("google") does a top-level redirect to `${API_URL}/auth/google`.
 * The backend runs the OAuth handshake, mints a 7-day JWT, and redirects to
 * `/auth/callback?token=…` on this SPA. AuthCallback calls login(token), which
 * stores the JWT in localStorage and decodes the user from it.
 *
 * Env: VITE_API_URL — backend origin (default http://localhost:5000).
 */

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000";

const TOKEN_KEY = "forge:token";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

/** Decode the JWT payload to extract the user and check expiration. */
function userFromToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null; // expired
    return {
      id: payload.sub,
      email: payload.email ?? "",
      name: payload.name,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isSigningIn: boolean;
  isAuthenticated: boolean;
  error: string | null;
  /** Start sign-in. "google" redirects to the backend OAuth entrypoint. */
  signIn: (provider: "google" | "apple") => void;
  /** Store a JWT (from the OAuth callback) and set the user. */
  login: (token: string) => void;
  /** Clear the token + user (and best-effort backend session teardown). */
  logout: () => void;
  /** Alias of logout, kept for existing callers. */
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // On load: hydrate the user from a stored token (if still valid).
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        const decoded = userFromToken(token);
        if (decoded) setUser(decoded);
        else localStorage.removeItem(TOKEN_KEY); // expired/garbage
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((token: string) => {
    const decoded = userFromToken(token);
    if (!decoded) {
      setError("Sign-in token was invalid or expired. Please try again.");
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    setUser(decoded);
    setError(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    // Best-effort backend session teardown; ignore failures.
    void fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);

  const signIn = useCallback((provider: "google" | "apple") => {
    if (provider !== "google") {
      setError("Apple sign-in is coming soon — use Google for now.");
      return;
    }
    setIsSigningIn(true);
    setError(null);
    // Top-level redirect into the backend OAuth entrypoint.
    window.location.href = `${API_URL}/auth/google`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSigningIn,
        isAuthenticated: user !== null,
        error,
        signIn,
        login,
        logout,
        signOut: logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
