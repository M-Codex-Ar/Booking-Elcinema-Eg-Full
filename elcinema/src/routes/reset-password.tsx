/** Password recovery: set a new password from the emailed recovery link. */
import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Set a new password | elCinema" },
      { name: "description", content: "Choose a new password for your elCinema account." },
      { property: "og:title", content: "Set a new password | elCinema" },
      { property: "og:description", content: "Choose a new password for your elCinema account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ResetPasswordPage() {
  const [ar, setAr] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Supabase delivers the recovery session in the URL hash (#access_token=…&type=recovery).
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setRecovery(hash.get("type") === "recovery");
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    if (password.length < 8) {
      setError(ar ? "كلمة المرور 8 أحرف على الأقل." : "Password must be at least 8 characters.");
      return;
    }
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) return setError(err.message);
    setDone(true);
  };

  const x = ar
    ? {
        title: "كلمة مرور جديدة",
        set: "حفظ كلمة المرور",
        done: "تم تحديث كلمة المرور.",
        login: "الدخول للوحة التحكم",
      }
    : {
        title: "Set a new password",
        set: "Save password",
        done: "Password updated.",
        login: "Open the dashboard",
      };

  return (
    <div className="cinema-gradient flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass-card w-full max-w-md rounded-3xl border border-border p-8 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-2xl font-black">{x.title}</h1>
        {done ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">{x.done}</p>
            <Link
              to="/auth"
              search={{ redirect: undefined }}
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground hover:bg-primary/90"
            >
              {x.login}
            </Link>
          </>
        ) : recovery ? (
          <form onSubmit={submit} className="mt-6 grid gap-3" dir={ar ? "rtl" : "ltr"}>
            <label className="flex items-center gap-3 rounded-xl border border-input bg-secondary px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder={ar ? "كلمة المرور الجديدة" : "New password"}
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground hover:bg-primary/90"
            >
              {x.set}
            </button>
            <button
              type="button"
              onClick={() => setAr((v) => !v)}
              className="justify-self-end text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              {ar ? "English" : "عربي"}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {ar
              ? "هذه الصفحة تعمل عبر رابط الاستعادة المرسل إلى بريدك."
              : "Open this page from the reset link we emailed you."}
          </p>
        )}
      </div>
    </div>
  );
}
