/** Login / Register modal with an animated tab switch between both forms. */
import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Lang } from "./home.shared";
import { makeT } from "./i18n";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { isAdmin } from "./auth";

export type AuthMode = "login" | "register";

function Field({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-input bg-secondary px-3 transition-colors focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--glow)]">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground";

export function AuthDialog({
  lang,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultMode = "login",
}: {
  lang: Lang;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: AuthMode;
}) {
  const t = makeT(lang);
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const [mode, setMode] = useState<AuthMode>(defaultMode);
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

    if (mode === "register") {
      const confirm = String(f.get("confirm") ?? "");
      if (password !== confirm) {
        return setError(t("auth.mismatch"));
      }
      const name = String(f.get("name") ?? "").trim();

      setBusy(true);
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
      setBusy(false);

      if (err) {
        const msg = err.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already in use")) {
          return setError(t("auth.alreadyRegistered"));
        }
        return setError(err.message);
      }

      if (data.session) {
        toast.success(t("auth.welcome"));
        setOpen(false);
      } else {
        toast.info(t("auth.checkEmail"));
        setOpen(false);
      }
    } else {
      // Login mode
      setBusy(true);
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setBusy(false);

      if (err) {
        const msg = err.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          return setError(t("auth.invalidCredentials"));
        }
        return setError(err.message);
      }

      const admin = isAdmin(data.user);
      toast.success(admin ? `${t("auth.welcome")} (${t("auth.adminRole")})` : t("auth.welcome"));
      setOpen(false);
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
    const { error: err } = await supabase.auth.resetPasswordForEmail(emailInput.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);

    if (err) {
      setError(err.message);
    } else {
      toast.success(t("auth.resetSent"));
    }
  };

  const switchTo = (m: AuthMode) => {
    setMode(m);
    setError("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setError("");
          setShowPassword(false);
          setShowConfirm(false);
        }
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="cinema-gradient overflow-hidden border-border bg-card p-0 sm:max-w-md"
      >
        <div className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black">
            {mode === "login" ? t("auth.welcome") : t("auth.join")}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            {t("auth.sub")}
          </DialogDescription>

          {/* Segmented toggle with a sliding pill */}
          <div className="relative mt-5 grid grid-cols-2 rounded-full border border-border bg-secondary p-1">
            <span
              aria-hidden
              className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-[0_6px_20px_-6px_var(--glow)] transition-all duration-300 ease-out ${
                mode === "login" ? "start-1" : "start-[calc(50%+3px)]"
              }`}
            />
            {(["login", "register"] as AuthMode[]).map((m) => (
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
        </div>

        <form
          key={mode}
          onSubmit={submit}
          className="animate-in fade-in-0 slide-in-from-bottom-2 grid gap-3 p-6 duration-300"
        >
          {mode === "register" && (
            <Field icon={<User className="h-4 w-4" />}>
              <input
                name="name"
                required
                placeholder={t("auth.name")}
                autoComplete="name"
                className={inputCls}
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
              className={inputCls}
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
              className={inputCls}
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
                className={inputCls}
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
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_10px_30px_-10px_var(--glow)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? t("auth.loading") : mode === "login" ? t("auth.login") : t("auth.register")}
          </button>
          <p className="text-center text-sm text-muted-foreground">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
