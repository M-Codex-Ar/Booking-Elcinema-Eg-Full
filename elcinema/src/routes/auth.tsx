/** Staff sign-in page: email + password (accounts are created by the admins). */
import { useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Clapperboard } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: safePath(search.redirect) });
  },
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Staff sign-in | elCinema" },
      { name: "description", content: "Sign in to manage the elCinema dashboard." },
      { property: "og:title", content: "Staff sign-in | elCinema" },
      { property: "og:description", content: "Sign in to manage the elCinema dashboard." },
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

const T = {
  en: {
    title: "Staff sign-in",
    sub: "Sign in to open the elCinema dashboard.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    forgot: "Forgot password?",
    note: "Accounts are created by the site administrator.",
    sent: "Reset link sent — check your email.",
    failed: "Wrong email or password.",
  },
  ar: {
    title: "دخول المشرفين",
    sub: "سجّل الدخول لفتح لوحة تحكم إل سينما.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "دخول",
    forgot: "نسيت كلمة المرور؟",
    note: "تُنشأ الحسابات بواسطة مدير الموقع.",
    sent: "تم إرسال رابط الاستعادة — تحقق من بريدك.",
    failed: "البريد أو كلمة المرور غير صحيحة.",
  },
} as const;

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
  const [ar, setAr] = useState(false);
  const x = ar ? T.ar : T.en;
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email: String(f.get("email") ?? ""),
      password: String(f.get("password") ?? ""),
    });
    setBusy(false);
    if (err) return setError(x.failed);
    toast.success(ar ? "مرحبًا بعودتك" : "Welcome back");
    window.location.assign(safePath(redirect));
  };

  const forgot = async (email: string) => {
    if (!email) return;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    toast[err ? "error" : "success"](err ? err.message : x.sent);
  };

  return (
    <div className="cinema-gradient flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass-card w-full max-w-md rounded-3xl border border-border p-8">
        <div className="flex items-center gap-3">
          <Clapperboard className="h-8 w-8 text-primary" />
          <button
            type="button"
            onClick={() => setAr((v) => !v)}
            className="ms-auto text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            {ar ? "English" : "عربي"}
          </button>
        </div>
        <h1 className="mt-4 text-2xl font-black">{x.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{x.sub}</p>

        <form onSubmit={submit} className="mt-6 grid gap-3" dir={ar ? "rtl" : "ltr"}>
          <Field icon={<Mail className="h-4 w-4" />}>
            <input
              name="email"
              type="email"
              required
              placeholder={x.email}
              autoComplete="email"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </Field>
          <Field icon={<Lock className="h-4 w-4" />}>
            <input
              name="password"
              type={show ? "text" : "password"}
              required
              placeholder={x.password}
              autoComplete="current-password"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={x.password}
              className="text-muted-foreground hover:text-primary"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Field>
          {error && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "…" : x.submit}
          </button>
          <button
            type="button"
            onClick={() => {
              const email = new FormData(document.querySelector("form")!).get("email");
              void forgot(String(email ?? ""));
            }}
            className="justify-self-end text-xs font-semibold text-primary hover:underline"
          >
            {x.forgot}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">{x.note}</p>
        <Link
          to="/$lang"
          params={{ lang: "en" }}
          className="mt-2 block text-center text-xs font-semibold text-primary hover:underline"
        >
          ← {ar ? "العودة للموقع" : "Back to the site"}
        </Link>
      </div>
    </div>
  );
}
