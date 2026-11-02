/** Login / Register modal with an animated tab switch between both forms. */
import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Lang } from "./home.shared";

type Mode = "login" | "register";

const T = {
  en: {
    login: "Login",
    register: "Register",
    welcome: "Welcome back",
    join: "Join elCinema",
    sub: "Rate movies, build watchlists and follow your favourite stars.",
    name: "Full name",
    email: "Email",
    password: "Password",
    confirm: "Confirm password",
    forgot: "Forgot password?",
    noAcc: "No account yet?",
    haveAcc: "Already a member?",
    mismatch: "Passwords don't match.",
    short: "Password must be at least 8 characters.",
    soon: "Accounts aren't switched on yet — your details were not saved.",
  },
  ar: {
    login: "دخول",
    register: "تسجيل",
    welcome: "مرحبًا بعودتك",
    join: "انضم إلى إل سينما",
    sub: "قيّم الأفلام وأنشئ قوائم المشاهدة وتابع نجومك المفضلين.",
    name: "الاسم بالكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirm: "تأكيد كلمة المرور",
    forgot: "نسيت كلمة المرور؟",
    noAcc: "ليس لديك حساب؟",
    haveAcc: "لديك حساب بالفعل؟",
    mismatch: "كلمتا المرور غير متطابقتين.",
    short: "كلمة المرور 8 أحرف على الأقل.",
    soon: "الحسابات غير مفعّلة بعد — لم يتم حفظ بياناتك.",
  },
} as const;

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

export function AuthDialog({ lang, trigger }: { lang: Lang; trigger: ReactNode }) {
  const x = T[lang];
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pw = String(f.get("password") ?? "");
    if (pw.length < 8) return setError(x.short);
    if (mode === "register" && pw !== String(f.get("confirm") ?? "")) return setError(x.mismatch);
    setError("");
    toast(x.soon);
    setOpen(false);
  };

  const switchTo = (m: Mode) => {
    setMode(m);
    setError("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setError("");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="cinema-gradient overflow-hidden border-border bg-card p-0 sm:max-w-md"
      >
        <div className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black">
            {mode === "login" ? x.welcome : x.join}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            {x.sub}
          </DialogDescription>

          {/* Segmented toggle with a sliding pill */}
          <div className="relative mt-5 grid grid-cols-2 rounded-full border border-border bg-secondary p-1">
            <span
              aria-hidden
              className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-[0_6px_20px_-6px_var(--glow)] transition-all duration-300 ease-out ${
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
                {m === "login" ? x.login : x.register}
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
                placeholder={x.name}
                autoComplete="name"
                className={inputCls}
              />
            </Field>
          )}
          <Field icon={<Mail className="h-4 w-4" />}>
            <input
              name="email"
              type="email"
              required
              placeholder={x.email}
              autoComplete="email"
              className={inputCls}
            />
          </Field>
          <Field icon={<Lock className="h-4 w-4" />}>
            <input
              name="password"
              type={show ? "text" : "password"}
              required
              placeholder={x.password}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className={inputCls}
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
          {mode === "register" && (
            <Field icon={<Lock className="h-4 w-4" />}>
              <input
                name="confirm"
                type={show ? "text" : "password"}
                required
                placeholder={x.confirm}
                autoComplete="new-password"
                className={inputCls}
              />
            </Field>
          )}
          {mode === "login" && (
            <button
              type="button"
              className="justify-self-end text-xs font-semibold text-primary hover:underline"
            >
              {x.forgot}
            </button>
          )}
          {error && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-1 rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_10px_30px_-10px_var(--glow)] active:scale-[0.98]"
          >
            {mode === "login" ? x.login : x.register}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? x.noAcc : x.haveAcc}{" "}
            <button
              type="button"
              onClick={() => switchTo(mode === "login" ? "register" : "login")}
              className="font-bold text-primary hover:underline"
            >
              {mode === "login" ? x.register : x.login}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
