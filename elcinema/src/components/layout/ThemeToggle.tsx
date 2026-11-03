/** Light/dark switch with a circular View Transition reveal from the button. */
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { Lang } from "@/features/home/home.shared";
import { makeT } from "@/i18n";
import { iconAction } from "@/components/shared/variants";

type Theme = "dark" | "light";

function applyTheme(next: Theme) {
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

  // The two labels are chrome, so they come from `i18n.ts` like every other
  // string; spelling them here is how a third language gets missed.
  const t = makeT(lang);
  const label = theme === "dark" ? t("theme.toLight") : t("theme.toDark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        iconAction(),
        // `bg-secondary` + a solid foreground: this control shows state, so it
        // needs more weight than a quiet rail arrow.
        "overflow-hidden bg-secondary text-foreground transition-all duration-300 hover:scale-110 hover:shadow-glow-sm active:scale-95",
        className,
      )}
    >
      {theme === "dark" ? (
        <Sun key="sun" className="animate-theme-icon h-4 w-4" />
      ) : (
        <Moon key="moon" className="animate-theme-icon h-4 w-4" />
      )}
    </button>
  );
}
