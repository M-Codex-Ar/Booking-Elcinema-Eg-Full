/** Light/dark switch with a circular View Transition reveal from the button. */
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import type { Lang } from "./home.shared";

type Theme = "dark" | "light";

export function applyTheme(next: Theme) {
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* storage unavailable */
  }
}

export function ThemeToggle({ lang, className = "" }: { lang: Lang; className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty(
      "--vt-r",
      `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`,
    );
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const run = () => {
      applyTheme(next);
      setTheme(next);
    };
    if (doc.startViewTransition && !reduce) {
      doc.startViewTransition(run);
    } else {
      root.classList.add("theme-fade");
      run();
      setTimeout(() => root.classList.remove("theme-fade"), 500);
    }
  };

  const label =
    theme === "dark"
      ? lang === "ar"
        ? "الوضع الفاتح"
        : "Switch to light mode"
      : lang === "ar"
        ? "الوضع الداكن"
        : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-foreground transition-all duration-300 hover:scale-110 hover:border-primary hover:text-primary hover:shadow-[0_0_18px_var(--glow)] active:scale-95 ${className}`}
    >
      {theme === "dark" ? (
        <Sun key="sun" className="animate-theme-icon h-4 w-4" />
      ) : (
        <Moon key="moon" className="animate-theme-icon h-4 w-4" />
      )}
    </button>
  );
}
