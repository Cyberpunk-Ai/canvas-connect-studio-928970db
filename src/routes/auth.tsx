import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Lock, AtSign, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Lumen — Your Social Home" },
      {
        name: "description",
        content:
          "Log in or create your Lumen account to share moments, join Spaces, and follow the creators you love.",
      },
      { property: "og:title", content: "Sign in to Lumen" },
      {
        property: "og:description",
        content: "Log in or create a Lumen account to share moments and join creator Spaces.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && session) navigate({ to: "/feed" });
  }, [session, sessionLoading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/feed`,
          data: { username: username.trim(), display_name: username.trim() },
        },
      });
      if (err) setError(err.message);
      else if (!data.session)
        setNotice("Check your inbox to confirm your email, then come back and log in.");
      setBusy(false);
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setBusy(false);
  }

  async function onGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/feed" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute left-1/4 top-10 h-96 w-96 animate-pulse rounded-full bg-violet-400 blur-[120px]" />
        <div className="absolute right-1/4 bottom-10 h-96 w-96 animate-pulse rounded-full bg-pink-400 blur-[120px] [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lumen
        </Link>

        <div className="glass-panel rounded-[2rem] p-8 shadow-lift sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {mode === "login" ? "Welcome back" : "Join "}
            {mode === "signup" && <span className="gradient-text">Lumen</span>}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "login"
              ? "Log in to pick up right where you left off."
              : "Create your account in seconds. Free forever."}
          </p>

          <button
            onClick={onGoogle}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-card py-3.5 text-sm font-bold transition-colors hover:bg-gray-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8H1.3v3.1A12 12 0 0 0 12 24Z"
              />
              <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
              <path
                fill="#EA4335"
                d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-gray-400">
            <span className="h-px flex-1 bg-gray-200" /> or <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field icon={AtSign}>
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </Field>
            )}
            <Field icon={Mail}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </Field>
            <Field icon={Lock}>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </Field>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {notice && <p className="text-sm font-medium text-brand">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-pink py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === "login" ? "New to Lumen?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
                setNotice(null);
              }}
              className="font-bold text-brand hover:underline"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-card px-4 py-3.5 transition-colors focus-within:border-brand">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      {children}
    </label>
  );
}
