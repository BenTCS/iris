import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Coins,
  Activity,
  ArrowLeft,
  RefreshCw,
  Clock,
  User as UserIcon,
  Gauge,
  LogIn,
  BookOpen,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import AmbientBackground from "@/components/AmbientBackground";

// Mock constant/helpers replacing the old Base44 library
const DAILY_CREDIT_ALLOTMENT = 100;
function msUntilMidnight(now) {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}
function formatDuration(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

function generateApiKey() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "vd_live_";
  for (let i = 0; i < 40; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const savedUser = localStorage.getItem('iris_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        setIsAuthenticated(false);
      }
    }
  }, []);

  async function loadKeys() {
    setKeysLoading(true);
    try {
      // Local storage fallback for API keys since base44 db is removed
      const savedKeys = localStorage.getItem('iris_api_keys');
      setKeys(savedKeys ? JSON.parse(savedKeys) : []);
    } catch (e) {
      setKeys([]);
    }
    setKeysLoading(false);
  }

  useEffect(() => {
    if (isAuthenticated) loadKeys();
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, [isAuthenticated]);

  async function handleCreateKey(e) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError(null);
    setRevealedKey(null);
    try {
      const fullKey = generateApiKey();
      const prefix = fullKey.slice(0, 12);
      const newKeyObj = {
        id: Date.now().toString(),
        name: newKeyName.trim(),
        key_prefix: prefix,
        key_value: fullKey,
        created_date: new Date().toISOString(),
      };

      const updatedKeys = [newKeyObj, ...keys];
      setKeys(updatedKeys);
      localStorage.setItem('iris_api_keys', JSON.stringify(updatedKeys));

      setRevealedKey(fullKey);
      setNewKeyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteKey(id) {
    try {
      const updatedKeys = keys.filter((k) => k.id !== id);
      setKeys(updatedKeys);
      localStorage.setItem('iris_api_keys', JSON.stringify(updatedKeys));
    } catch (e) {
      // ignore
    }
  }

  function copyKey() {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const credits = user?.credits ?? DAILY_CREDIT_ALLOTMENT;
  const creditsUsedToday = Math.max(0, DAILY_CREDIT_ALLOTMENT - credits);
  const usagePct = Math.min(100, Math.round((creditsUsedToday / DAILY_CREDIT_ALLOTMENT) * 100));
  const resetsIn = formatDuration(msUntilMidnight(now));

  async function resetCredits() {
    setResetting(true);
    try {
      const updatedUser = { ...user, credits: DAILY_CREDIT_ALLOTMENT };
      setUser(updatedUser);
      localStorage.setItem('iris_user', JSON.stringify(updatedUser));
    } catch (err) {
      setError("Failed to reset credits.");
    } finally {
      setResetting(false);
    }
  }

  const memberSince = user?.created_date
    ? new Date(user.created_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to chat
          </Link>
          <p className="text-sm font-medium">{user?.email ?? "Not signed in"}</p>
        </header>

        <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

        {isAuthenticated ? (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Credits card */}
              <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Coins className="size-4" />
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em]">
                      Credits
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                    <Clock className="size-3" />
                    Resets in {resetsIn}
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">
                  {credits.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  1 credit = 1 second of thinking · {DAILY_CREDIT_ALLOTMENT.toLocaleString()} daily
                </p>

                {/* Usage bar */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[0.65rem] text-muted-foreground">
                    <span>Used today</span>
                    <span className="tabular-nums">
                      {creditsUsedToday.toLocaleString(undefined, { maximumFractionDigits: 0 })} /{" "}
                      {DAILY_CREDIT_ALLOTMENT.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/70">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>

                {user?.role === "admin" ? (
                  <button
                    type="button"
                    onClick={resetCredits}
                    disabled={resetting}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                  >
                    {resetting ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                    Reset now
                  </button>
                ) : (
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    Resets automatically at midnight
                  </p>
                )}
              </div>

              {/* API keys card */}
              <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Key className="size-4" />
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em]">
                    API Keys
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{keys.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No limit on keys · Unlimited usage
                </p>
                <Link
                  to="/api-docs"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-opacity hover:opacity-80"
                >
                  <BookOpen className="size-3.5" />
                  How to use your API key
                </Link>
              </div>
            </div>

            {/* Account + Usage overview */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <UserIcon className="size-4" />
                  Account
                </h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="truncate font-medium">{user?.email ?? "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="flex items-center gap-1.5 font-medium capitalize">
                      {user?.role === "admin" && <Shield className="size-3.5 text-primary" />}
                      {user?.role ?? "User"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Member since</dt>
                    <dd className="font-medium">{memberSince}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Gauge className="size-4" />
                  Usage overview
                </h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Daily allotment</dt>
                    <dd className="font-medium tabular-nums">
                      {DAILY_CREDIT_ALLOTMENT.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Remaining today</dt>
                    <dd className="font-medium tabular-nums">
                      {credits.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Resets at</dt>
                    <dd className="font-medium">Midnight (local)</dd>
                  </div>
                </dl>
              </section>
            </div>
          </>
        ) : (
          <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <LogIn className="size-4" />
              Sign in
            </h2>
            <p className="text-sm text-muted-foreground">
              The rest of the dashboard — credits, usage, and your saved API keys — is available after you sign in.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          </section>
        )}

        {/* Create key */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Plus className="size-4" />
            Create new API key
          </h2>
          <form onSubmit={handleCreateKey} className="flex gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. Production)"
              className="flex-1 rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" disabled={creating || !newKeyName.trim()} className="h-10 gap-1.5 rounded-xl">
              {creating ? <Loader2 className="size-4 animate-spin" /> : "Create"}
            </Button>
          </form>

          {error && (
            <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          {revealedKey && (
            <div className="mt-4 animate-fade-up rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="mb-2 text-xs font-medium text-foreground">
                Copy your key now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg bg-background/80 px-3 py-2 font-mono text-xs">
                  {revealedKey}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyKey}
                  aria-label="Copy key"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Keys list */}
        {isAuthenticated && (
          <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4" />
              Your API keys
            </h2>

            {keysLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No API keys yet. Create one above to get started.
              </p>
            ) : (
              <ul className="space-y-2">
                {keys.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{k.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {k.key_prefix}…
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs text-muted-foreground">
                        {new Date(k.created_date).toLocaleDateString()}
                      </p>
                      {k.last_used_at && (
                        <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                          Used {new Date(k.last_used_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteKey(k.id)}
                      aria-label={`Delete key ${k.name}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}