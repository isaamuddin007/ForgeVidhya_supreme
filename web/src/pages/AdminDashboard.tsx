import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Megaphone, RefreshCw, Shield, Trash2, Users } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { FadeIn } from "@/components/ui/primitives";
import { useAuth } from "@/hooks/useAuth";
import { API_URL } from "@/lib/api";

/**
 * AdminDashboard — the admin-only control panel (route: /admin).
 *
 * Access: only the allow-listed admin mobile number receives role 'admin', and
 * every endpoint used here is additionally guarded server-side by
 * protect + authorize('admin'). The client-side check below is UX only — it
 * hides the panel, it is not the security boundary.
 *
 * Capabilities: publish the site-wide announcement (visible to every visitor),
 * review registered users, and remove a user. Admin accounts can't be deleted.
 */


interface AdminUser {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { isLoading, isAuthenticated, isAdmin, getToken } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const api = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const token = getToken();
      const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init.headers || {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
      return data;
    },
    [getToken]
  );

  const load = useCallback(async () => {
    setBusy(true);
    setNotice(null);
    try {
      const [usersRes, contentRes] = await Promise.all([
        api("/api/admin/users"),
        api("/api/content"),
      ]);
      setUsers(usersRes.users ?? []);
      setContent(contentRes.content ?? "");
      setUpdatedAt(contentRes.updatedAt ?? null);
    } catch (e) {
      setNotice({ kind: "err", text: e instanceof Error ? e.message : "Could not load data." });
    } finally {
      setBusy(false);
    }
  }, [api]);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const saveContent = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await api("/api/admin/content", {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      setUpdatedAt(res.updatedAt ?? new Date().toISOString());
      setNotice({ kind: "ok", text: "Announcement published — it's now live on the site." });
    } catch (e) {
      setNotice({ kind: "err", text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (u: AdminUser) => {
    const label = u.phone ?? u.email ?? u.id;
    if (!window.confirm(`Remove ${label}? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setNotice({ kind: "ok", text: `Removed ${label}.` });
    } catch (e) {
      setNotice({ kind: "err", text: e instanceof Error ? e.message : "Could not remove user." });
    }
  };

  // ---- access states ------------------------------------------------------
  if (isLoading) {
    return (
      <Layout>
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <Layout>
        <SEO title="Admin" description="Administrator dashboard." />
        <section className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Shield className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">Admin access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAuthenticated
              ? "This account doesn't have administrator rights. Sign in with the approved admin mobile number."
              : "Sign in with the approved admin mobile number to open the dashboard."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d7b460] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </section>
      </Layout>
    );
  }

  // ---- dashboard ----------------------------------------------------------
  return (
    <Layout>
      <SEO title="Admin dashboard" description="Manage forgeVidhya content and users." />

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Shield className="h-3.5 w-3.5" /> Administrator
              </span>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Admin dashboard
              </h1>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              disabled={busy}
              className="glass-soft inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </FadeIn>

        {notice && (
          <div
            className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-medium ${
              notice.kind === "ok"
                ? "bg-primary/10 text-primary"
                : "bg-forge-red/10 text-forge-red"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={<Users className="h-5 w-5" />} label="Registered users" value={String(users.length)} />
          <StatCard
            icon={<Shield className="h-5 w-5" />}
            label="Admins"
            value={String(users.filter((u) => u.role === "admin").length)}
          />
          <StatCard
            icon={<Megaphone className="h-5 w-5" />}
            label="Announcement updated"
            value={updatedAt ? new Date(updatedAt).toLocaleDateString() : "Never"}
          />
        </div>

        {/* content editor */}
        <FadeIn>
          <div className="glass-card mt-8 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">Site announcement</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Shown to every visitor at the top of the home page. Leave empty to hide it.
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="e.g. Cohort #5 applications close on 30 August."
              className="glass-input mt-4 w-full rounded-xl p-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{content.length}/2000</span>
              <button
                type="button"
                onClick={() => void saveContent()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#d7b460] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
                {saving ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>
        </FadeIn>

        {/* users */}
        <FadeIn>
          <div className="glass-card mt-8 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">Users</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everyone who has signed in. Admin accounts can't be removed.
            </p>

            {users.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                {busy ? "Loading…" : "No users yet."}
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-border/60">
                {users.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {u.phone ?? u.email ?? "(no identifier)"}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {u.role} · joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {u.role === "admin" ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Admin
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void removeUser(u)}
                        aria-label={`Remove ${u.phone ?? u.email ?? "user"}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-forge-red/40 hover:bg-forge-red/10 hover:text-forge-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
        {icon}
      </span>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
