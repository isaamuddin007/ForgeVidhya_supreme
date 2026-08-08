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
 * email/password endpoints.
 *
 * Flow: register/loginWithPassword POST to `${API_URL}/auth/(register|login)`.
 * On success the backend returns a 7-day JWT, which we store in localStorage and
 * decode to hydrate the user. Mobile-number (OTP) sign-in is planned next and
 * will slot in alongside these methods, reusing login(token).
 *
 * Env: VITE_API_URL — backend origin (default http://localhost:5000).
 */

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000";

const TOKEN_KEY = "forge:token";

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  picture?: string;
  role?: string;
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
      phone: payload.phone,
      name: payload.name,
      picture: payload.picture,
      role: payload.role,
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
  /** True only for the allow-listed admin number (role claim in the JWT). */
  isAdmin: boolean;
  error: string | null;
  /** Send a one-time code by SMS to a mobile number. Resolves true on success. */
  sendOtp: (phone: string) => Promise<boolean>;
  /**
   * Set when a code was generated but NOT delivered by SMS (e.g. Twilio isn't
   * configured, so it went to the API server console). Null on a real send.
   */
  otpNotice: string | null;
  /** Verify the code and sign in. Resolves true on success. */
  verifyOtp: (phone: string, code: string) => Promise<boolean>;
  /** The JWT for API calls (admin dashboard). Null when signed out. */
  getToken: () => string | null;
  /** Email/password sign-in. Resolves true on success. */
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  /** Create an email/password account. Resolves true on success. */
  register: (name: string, email: string, password: string) => Promise<boolean>;
  /** Store a JWT and set the user (used by the credential flow). */
  login: (token: string) => void;
  /** Clear the token + user (and best-effort backend cookie teardown). */
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
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

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
    // Best-effort backend cookie teardown; ignore failures.
    void fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);

  // Shared POST for /auth/register and /auth/login. On success the backend
  // returns { token }; we store it (login) and the user is signed in.
  const submitCredentials = useCallback(
    async (path: string, body: Record<string, string>): Promise<boolean> => {
      setIsSigningIn(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg =
            data?.errors?.[0]?.message ||
            data?.message ||
            `Request failed (${res.status})`;
          setError(msg);
          return false;
        }
        if (data.token) {
          login(data.token);
          return true;
        }
        setError("Unexpected response from the server.");
        return false;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Network error — is the API running?");
        return false;
      } finally {
        setIsSigningIn(false);
      }
    },
    [login]
  );

  const loginWithPassword = useCallback(
    (email: string, password: string) => submitCredentials("/auth/login", { email, password }),
    [submitCredentials]
  );

  const register = useCallback(
    (name: string, email: string, password: string) =>
      submitCredentials("/auth/register", { name, email, password }),
    [submitCredentials]
  );

  // --- Mobile number (OTP) -------------------------------------------------
  // The backend never returns the code; it is delivered by SMS (or, in dev
  // without Twilio, printed to the API server's console).
  const sendOtp = useCallback(async (phone: string): Promise<boolean> => {
    setIsSigningIn(true);
    setError(null);
    setOtpNotice(null);
    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setError(data?.message || `Could not send the code (${res.status})`);
        return false;
      }
      // The API tells us whether an SMS actually went out. If it didn't, say so
      // plainly instead of leaving the user waiting for a text.
      if (data.delivery && data.delivery !== "sms") {
        setOtpNotice(
          data.reason
            ? `No SMS sent — ${data.reason} The code is printed in the API server console.`
            : "No SMS sent — the code is printed in the API server console."
        );
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error — is the API running?");
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string): Promise<boolean> => {
      setIsSigningIn(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/auth/otp/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phone, code }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success || !data.token) {
          setError(data?.message || `Verification failed (${res.status})`);
          return false;
        }
        login(data.token);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Network error — is the API running?");
        return false;
      } finally {
        setIsSigningIn(false);
      }
    },
    [login]
  );

  const getToken = useCallback(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSigningIn,
        isAuthenticated: user !== null,
        isAdmin: user?.role === "admin",
        error,
        otpNotice,
        sendOtp,
        verifyOtp,
        getToken,
        loginWithPassword,
        register,
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
