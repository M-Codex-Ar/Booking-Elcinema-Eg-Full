/** Staff & user sign-in/register page using the same segmented login/register switch. */
import { useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
  Clapperboard,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/services/clients/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import type { Lang } from "@/types/home";
import { makeT } from "@/i18n";
import { isAdmin, describeAuthError } from "@/features/auth/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  beforeLoad: async ({ search }) => {
    if (!isSupabaseConfigured()) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: safePath(search.redirect) });
  },
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in | elCinema" },
      { name: "description", content: "Sign in or register for elCinema." },
      { property: "og:title", content: "Sign in | elCinema" },
      { property: "og:description", content: "Sign in or register for elCinema." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

/** Only same-origin relative paths may be used as a post-login target. */
function safePath(raw: string | undefined): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/en";
}

type Mode = "login" | "register";

function Field({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-input bg-secondary px-3 transition-colors focus-within:border-primary">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </label>
  );
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const [lang, setLang] = useState<Lang>("en");
  const t = makeT(lang);
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setError("");

    if (!isSupabaseConfigured()) {
      setError(t("auth.notEnabled"));
      return;
    }

    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");

    if (password.length < 8) {
      return setError(t("auth.short"));
    }

    setBusy(true);
    try {
      if (mode === "register") {
        const confirm = String(f.get("confirm") ?? "");
        if (password !== confirm) {
          setError(t("auth.mismatch"));
          return;
        }
        const name = String(f.get("name") ?? "").trim();
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: "user",
            },
          },
        });

        if (err) {
          setError(describeAuthError(t, err.message));
          return;
        }

        if (data.session) {
          toast.success(t("auth.welcome"));
          let target = safePath(redirect);
          if (target.includes("/dashboard")) target = `/${lang}`;
          window.location.assign(target);
        } else {
          toast.info(t("auth.checkEmail"));
        }
        return;
      }

      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(describeAuthError(t, err.message));
        return;
      }

      toast.success(t("auth.welcome"));
      const admin = isAdmin(data.user);
      let target = safePath(redirect);
      if (admin && (!redirect || target === "/en" || target === "/ar")) {
        target = `/${lang}/dashboard`;
      } else if (!admin && target.includes("/dashboard")) {
        target = `/${lang}`;
      }
      window.location.assign(target);
    } catch {
      setError(t("auth.requestFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    if (!isSupabaseConfigured()) {
      return setError(t("auth.notEnabled"));
    }
    if (!emailInput.trim()) {
      return setError(t("auth.enterEmailFirst"));
    }
    setBusy(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(emailInput.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) {
        setError(describeAuthError(t, err.message));
      } else {
        toast.success(t("auth.resetSent"));
      }
    } catch {
      setError(t("auth.requestFailed"));
    } finally {
      setBusy(false);
    }
  };

  const switchTo = (m: Mode) => {
    setMode(m);
    setError("");
  };

  return (
    <div className="page-background flex min-h-screen items-center justify-center px-4">
      <div
        className="glass-card w-full max-w-md rounded-3xl border border-border p-8"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-3">
          <Clapperboard className="h-8 w-8 text-primary" />
          <button
            type="button"
            onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
            className="ms-auto text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            {t("chrome.switchTo")}
          </button>
        </div>

        <h1 className="mt-4 text-2xl font-black">
          {mode === "login" ? t("auth.welcome") : t("auth.join")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.sub")}</p>

        {/* Segmented toggle with a sliding pill */}
        <div className="relative mt-5 grid grid-cols-2 rounded-full border border-border bg-secondary p-1">
          <span
            aria-hidden
            className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-glow-sm transition-all duration-300 ease-out ${
              mode === "login" ? "start-1" : "start-[calc(50%+3px)]"
            }`}
          />
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchTo(m)}
              aria-pressed={mode === m}
              className={`relative z-10 flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold transition-colors ${
                mode === m
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {m === "login" ? t("auth.login") : t("auth.register")}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          {mode === "register" && (
            <Field icon={<User className="h-4 w-4" />}>
              <input
                name="name"
                required
                placeholder={t("auth.name")}
                autoComplete="name"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                disabled={busy}
              />
            </Field>
          )}
          <Field icon={<Mail className="h-4 w-4" />}>
            <input
              name="email"
              type="email"
              required
              placeholder={t("auth.email")}
              autoComplete="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              disabled={busy}
            />
          </Field>
          <Field icon={<Lock className="h-4 w-4" />}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder={t("auth.password")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              className="text-muted-foreground hover:text-primary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Field>
          {mode === "register" && (
            <Field icon={<Lock className="h-4 w-4" />}>
              <input
                name="confirm"
                type={showConfirm ? "text" : "password"}
                required
                placeholder={t("auth.confirm")}
                autoComplete="new-password"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? t("auth.hidePassword") : t("auth.showPassword")}
                className="text-muted-foreground hover:text-primary"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>
          )}
          {mode === "login" && (
            <button
              type="button"
              onClick={handleForgot}
              disabled={busy}
              className="justify-self-end text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            >
              {t("auth.forgot")}
            </button>
          )}
          {error && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-glow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? t("auth.loading") : mode === "login" ? t("auth.login") : t("auth.register")}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? t("auth.noAcc") : t("auth.haveAcc")}{" "}
          <button
            type="button"
            onClick={() => switchTo(mode === "login" ? "register" : "login")}
            className="font-bold text-primary hover:underline"
            disabled={busy}
          >
            {mode === "login" ? t("auth.register") : t("auth.login")}
          </button>
        </p>

        <Link
          to="/$lang"
          params={{ lang }}
          className="mt-4 block text-center text-xs font-semibold text-primary hover:underline"
        >
          ← {t("common.backToSite")}
        </Link>
      </div>
    </div>
  );
}
