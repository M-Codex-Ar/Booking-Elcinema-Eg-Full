/**
 * Bilingual site chrome for the elCinema experience: sticky header with
 * search and the EN/AR switch, and the full elCinema-style footer.
 */
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, Search } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import type { Lang } from "./home.shared";
import { Na } from "./ui";
import { ThemeToggle } from "./ThemeToggle";
import { SiteMenu, NAV_GROUPS } from "./SiteMenu";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_URL =
  "https://cdn.elcinema.com/assets/elCinema_logo-be1ed6273cf8fae2f6f2f9b250964c19ed6d3aebcf87dabf30d040347f7046eb.png";
const FOOTER_LOGO_URL =
  "https://cdn.elcinema.com/assets/footer/elcinema-fca17c1d54bb1b93eedc0a92818163a4c95ac5fb75bf21157e6a5b4a3f988f65.png";

const COPY = {
  en: {
    login: "login",
    search: "Search",
    nav: [
      ["now", "Now Playing"],
      ["soon", "Coming Soon"],
      ["tvguide", "TV Guide"],
      ["boxoffice", "Box Office"],
    ] as const,
    switchTo: "عربي",
    footer1: [
      ["now", "Now Playing"],
      ["tvguide", "TV Guide"],
      ["soon", "Coming Soon"],
      ["boxoffice", "Cinema Revenue"],
    ] as const,
    footer2: [
      ["search", "Search"],
      ["boxoffice", "Weekly Box Office"],
      ["soon", "December Releases"],
      ["tvguide", "Tonight on TV"],
    ] as const,
    copyright: "Copyright © Damlag S.A.E — sample replica for demo purposes",
    chairman: "Chairman: Khaled Hesham",
    editor: "Editor-in-Chief: Doaa Mohamed",
  },
  ar: {
    login: "تسجيل الدخول",
    search: "ابحث",
    nav: [
      ["now", "السينمات الآن"],
      ["soon", "قريباً"],
      ["tvguide", "جدول القنوات"],
      ["boxoffice", "بوكس أوفيس"],
    ] as const,
    switchTo: "English",
    footer1: [
      ["now", "السينمات الآن"],
      ["tvguide", "جدول القنوات"],
      ["soon", "قريباً"],
      ["boxoffice", "إيرادات السينما"],
    ] as const,
    footer2: [
      ["search", "بحث"],
      ["boxoffice", "بوكس أوفيس الأسبوعي"],
      ["soon", "أفلام ديسمبر"],
      ["tvguide", "الليلة على التلفاز"],
    ] as const,
    copyright: "جميع الحقوق محفوظة © دملاج س.أ.م — نسخة تجريبية للعرض فقط",
    chairman: "رئيس مجلس الإدارة: خالد هشام",
    editor: "مدير التحرير: ضياء محمد",
  },
};

const SOCIAL = {
  facebook: "https://www.facebook.com/elCinemaEgypt/",
  x: "https://x.com/elCinema",
  instagram: "https://www.instagram.com/elcinemagram/",
};

const Facebook = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M14 8V6c0-.9.6-1 1-1h3V1h-4c-3.3 0-4 2.4-4 4v3H7v4h3v11h4V12h3.5l.5-4h-4z" />
  </svg>
);
const Twitter = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 4H5.1L17 20z" />
  </svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary";

export function SiteHeader({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [query, setQuery] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setSignedIn(!!session),
    );
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign(`/${lang}`);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.assign(`/${lang}/search?q=${encodeURIComponent(query.trim())}`);
  };
  // /en/work/x -> /ar/work/x ; keep the rest of the path intact.
  const otherLang: Lang = lang === "en" ? "ar" : "en";
  const otherPath = "/" + pathname.replace(/^\/(en|ar)/, otherLang);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-8">
        <Na href={`/${lang}`} className="shrink-0">
          <img src={LOGO_URL} alt="elCinema" className="site-logo h-8" />
        </Na>
        <nav className="ms-2 hidden items-center gap-1 lg:flex">
          {NAV_GROUPS.map((group) => (
            <NavDropdown key={group.en} lang={lang} group={group} />
          ))}
        </nav>
        {signedIn ? (
          <div className="ms-2 hidden items-center gap-2 sm:flex">
            <Na
              href={`/${lang}/dashboard`}
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <LayoutDashboard className="h-4 w-4" /> {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
            </Na>
            <button
              type="button"
              onClick={signOut}
              aria-label={lang === "ar" ? "خروج" : "Sign out"}
              title={lang === "ar" ? "خروج" : "Sign out"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Na
            href="/auth"
            className="ms-2 hidden items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_8px_24px_-8px_var(--glow)] sm:inline-flex"
          >
            <LogIn className="h-4 w-4" /> {c.login}
          </Na>
        )}
        <div className="ms-auto flex items-center gap-2">
          <form
            onSubmit={submit}
            className="flex items-center overflow-hidden rounded-lg border border-input bg-secondary"
          >
            <input
              type="text"
              placeholder={c.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-24 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground md:w-48"
            />
            <button
              type="submit"
              aria-label={c.search}
              className="bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          <a
            href={SOCIAL.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className={`${iconBtn} hidden md:flex`}
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className={`${iconBtn} hidden md:flex`}
          >
            <Twitter className="h-4 w-4" />
          </a>
          <ThemeToggle lang={lang} />
          <SiteMenu lang={lang} />
          <Na
            href={otherPath}
            className="flex items-center gap-1 text-sm font-semibold hover:text-primary"
          >
            {c.switchTo}
          </Na>
        </div>
      </div>
    </header>
  );
}

function NavDropdown({ lang, group }: { lang: Lang; group: (typeof NAV_GROUPS)[number] }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = group.items.some(
    (it) => pathname === `/${lang}/${it.seg}` || pathname.startsWith(`/${lang}/${it.seg}/`),
  );
  const go = (seg: string) => void navigate({ to: `/${lang}/${seg}` as never });
  return (
    <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"}>
      <DropdownMenuTrigger
        className={`group flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors hover:bg-secondary data-[state=open]:bg-secondary ${
          active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {group[lang]}
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="w-60 border-border bg-popover p-2"
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          {lang === "ar" ? "أقسام" : "Sections"}
        </DropdownMenuLabel>
        {group.items.map((it, i) => (
          <DropdownMenuItem
            key={it.seg}
            onSelect={() => go(it.seg)}
            className={`cursor-pointer gap-2 rounded-lg py-2 font-semibold focus:bg-accent focus:text-primary ${
              i > 0 ? "mt-0.5 border-t border-border/60 pt-2" : ""
            }`}
          >
            <it.icon className="h-4 w-4 text-primary" /> {it[lang]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => go("search")}
          className="cursor-pointer gap-2 rounded-lg py-2 font-semibold focus:bg-accent focus:text-primary"
        >
          <Search className="h-4 w-4 text-primary" />{" "}
          {lang === "ar" ? "بحث متقدم" : "Search the catalogue"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LinkList({ links, lang }: { links: readonly (readonly [string, string])[]; lang: Lang }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-1 gap-y-2 text-sm">
      {links.map(([seg, label], i) => (
        <li key={seg} className="flex items-center gap-1">
          {i > 0 && <span className="text-border">|</span>}
          <Na
            href={`/${lang}/${seg}`}
            className="px-1 text-muted-foreground transition-colors hover:text-primary"
          >
            {label}
          </Na>
        </li>
      ))}
    </ul>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex justify-end gap-2">
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className={iconBtn}
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href={SOCIAL.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className={iconBtn}
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="X" className={iconBtn}>
            <Twitter className="h-4 w-4" />
          </a>
        </div>
        <hr className="my-6 border-border" />
        <div className="space-y-4">
          <LinkList links={c.footer1} lang={lang} />
          <LinkList links={c.footer2} lang={lang} />
        </div>
        <hr className="my-6 border-border" />
        <div className="grid items-center gap-4 md:grid-cols-4">
          <img
            src={FOOTER_LOGO_URL}
            alt="elCinema"
            className="h-12 w-auto justify-self-start rounded-md bg-foreground p-1"
          />
          <div className="space-y-1 text-center text-sm text-muted-foreground md:col-span-2">
            <div>{c.copyright}</div>
            <div>{c.chairman}</div>
            <div>{c.editor}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
