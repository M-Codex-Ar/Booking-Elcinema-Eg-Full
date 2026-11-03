/**
 * Bilingual site chrome for the elCinema experience: sticky header with
 * search and the EN/AR switch, and the full elCinema-style footer.
 */
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, Search, Send, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouterState } from "@tanstack/react-router";
import type { Lang } from "./home.shared";
import { ImgWithFallback, SmartImg } from "./components/primitives";
import { Na } from "./ui";
import { ThemeToggle } from "./ThemeToggle";
import { SiteMenu, NAV_GROUPS } from "./SiteMenu";
import { AuthDialog } from "./AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { isAdmin, getUserDisplayName } from "./auth";
import { makeT } from "./i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Wordmarks served first-party from `public/images/brand/` (mirrored by
 * `scripts/mirror-artwork.mjs --kinds=logos`) instead of hotlinking
 * cdn.elcinema.com, so a renamed asset hash or a referrer rule can never blank
 * the header. `SmartImg` still draws the placeholder wordmark if the file is
 * missing.
 */
const LOGO_URL = "/images/brand/logo.png";
const FOOTER_LOGO_URL = "/images/brand/footer-logo.png";

const COPY = {
  en: {
    login: "Login",
    dashboard: "Dashboard",
    signOut: "Sign out",
    search: "Search",
    nav: [
      ["now", "Now Playing"],
      ["soon", "Coming Soon"],
      ["tvguide", "TV Guide"],
      ["boxoffice", "Box Office"],
    ] as const,
    switchTo: "عربي",
  },
  ar: {
    login: "تسجيل الدخول",
    dashboard: "لوحة التحكم",
    signOut: "خروج",
    search: "ابحث",
    nav: [
      ["now", "السينمات الآن"],
      ["soon", "قريباً"],
      ["tvguide", "جدول القنوات"],
      ["boxoffice", "بوكس أوفيس"],
    ] as const,
    switchTo: "English",
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
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setCurrentUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setCurrentUser(session?.user ?? null),
    );
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signedIn = !!currentUser;
  const admin = isAdmin(currentUser);
  const displayName = getUserDisplayName(currentUser);

  const signOut = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
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
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-1.5 px-3 sm:gap-2 md:gap-3 md:px-8">
        <Na href={`/${lang}`} className="flex h-9 shrink-0 items-center">
          <SmartImg
            src={LOGO_URL}
            alt="elCinema"
            kind="logo"
            eager
            className="site-logo h-7 max-w-[100px] object-contain sm:h-8 sm:max-w-none"
          />
        </Na>
        <nav className="ms-2 hidden items-center gap-1 lg:flex">
          {NAV_GROUPS.map((group) => (
            <NavDropdown key={group.en} lang={lang} group={group} />
          ))}
        </nav>
        {signedIn ? (
          <div className="ms-2 hidden items-center gap-2 sm:flex">
            {admin ? (
              <Na
                href={`/${lang}/dashboard`}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
              >
                <LayoutDashboard className="h-4 w-4" /> {c.dashboard}
              </Na>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </span>
            )}
            <button
              type="button"
              onClick={signOut}
              aria-label={c.signOut}
              title={c.signOut}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="ms-2 hidden sm:block">
            <AuthDialog
              lang={lang}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_8px_24px_-8px_var(--glow)]"
                >
                  <LogIn className="h-4 w-4" /> {c.login}
                </button>
              }
            />
          </div>
        )}
        <div className="ms-auto flex shrink-0 items-center gap-1 sm:gap-1.5 md:gap-2">
          {/* Mobile auth button */}
          {signedIn ? (
            <div className="flex shrink-0 items-center gap-1 sm:hidden">
              {admin ? (
                <Na
                  href={`/${lang}/dashboard`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                </Na>
              ) : (
                <span
                  title={displayName}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground"
                >
                  <User className="h-3.5 w-3.5 text-primary" />
                </span>
              )}
              <button
                type="button"
                onClick={signOut}
                aria-label={c.signOut}
                title={c.signOut}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 sm:hidden">
              <AuthDialog
                lang={lang}
                trigger={
                  <button
                    type="button"
                    aria-label={c.login}
                    title={c.login}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                  </button>
                }
              />
            </div>
          )}
          {/*
            Phone widths cannot fit a text field next to the login, theme, menu
            and language targets — the row overflowed and pushed the language
            switch off-screen in RTL. Below `sm` search is therefore a full-size
            icon button into the same results page the form submits to.
          */}
          <Na
            href={`/${lang}/search`}
            label={c.search}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:hidden"
          >
            <Search className="h-4 w-4" />
          </Na>
          <form
            onSubmit={submit}
            className="hidden h-9 items-center overflow-hidden rounded-lg border border-input bg-secondary sm:flex"
          >
            <input
              type="text"
              placeholder={c.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-full w-24 bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground sm:text-sm md:w-48 md:px-3"
            />
            <button
              type="submit"
              aria-label={c.search}
              className="flex h-full min-w-10 items-center justify-center bg-primary px-2.5 text-primary-foreground hover:bg-primary/90 md:px-3"
            >
              <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
            className="flex h-9 min-w-10 shrink-0 items-center justify-center gap-1 rounded-md px-2 whitespace-nowrap text-xs font-semibold hover:text-primary sm:text-sm"
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

/** Visa SVG card icon */
const VisaIcon = () => (
  <svg viewBox="0 0 48 16" className="h-6 w-auto" aria-label="Visa" role="img">
    <rect width="48" height="16" rx="2" fill="#1a1f71" />
    <text x="7" y="12" fontSize="9" fontWeight="bold" fill="#fff" fontFamily="Arial,sans-serif">
      VISA
    </text>
  </svg>
);
/** Mastercard SVG card icon */
const MastercardIcon = () => (
  <svg viewBox="0 0 48 30" className="h-7 w-auto" aria-label="Mastercard" role="img">
    <rect width="48" height="30" rx="3" fill="#252525" />
    <circle cx="18" cy="15" r="9" fill="#eb001b" />
    <circle cx="30" cy="15" r="9" fill="#f79e1b" />
    <path d="M24 8.27a9 9 0 0 1 0 13.46A9 9 0 0 1 24 8.27z" fill="#ff5f00" />
  </svg>
);
/** Fawry SVG card icon */
const FawryIcon = () => (
  <svg viewBox="0 0 48 20" className="h-6 w-auto" aria-label="Fawry" role="img">
    <rect width="48" height="20" rx="2" fill="#f37021" />
    <text x="6" y="14" fontSize="8" fontWeight="bold" fill="#fff" fontFamily="Arial,sans-serif">
      fawry
    </text>
  </svg>
);
/** Meza SVG card icon */
const MezaIcon = () => (
  <svg viewBox="0 0 48 20" className="h-6 w-auto" aria-label="Meeza" role="img">
    <rect width="48" height="20" rx="2" fill="#c8102e" />
    <text x="5" y="14" fontSize="8" fontWeight="bold" fill="#fff" fontFamily="Arial,sans-serif">
      meeza
    </text>
  </svg>
);

const FOOTER_NAV = [
  ["now", "nav.now"],
  ["soon", "nav.soon"],
  ["tvguide", "nav.tvguide"],
  ["boxoffice", "nav.boxoffice"],
  ["vod", "nav.vod"],
  ["video", "nav.video"],
  ["lineup", "nav.lineup"],
] as const;

const FOOTER_HELP = [
  ["about", "footer.about"],
  ["contact", "footer.contact"],
  ["advertise", "footer.advertise"],
  ["privacy", "footer.privacy"],
  ["terms", "footer.terms"],
] as const;

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-border bg-card">
      {/* ── Top band: 4 columns ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 – About */}
          <div className="flex flex-col gap-4">
            <ImgWithFallback
              src={FOOTER_LOGO_URL}
              alt="elCinema"
              fit="contain"
              className="h-10 w-auto self-start rounded-md bg-foreground p-1"
              fallback={
                <span className="self-start rounded-md bg-foreground px-2 py-1 text-lg font-black text-background">
                  elCinema
                </span>
              }
            />
            <p className="text-sm leading-relaxed text-muted-foreground">{t("footer.siteDesc")}</p>
            <div className="flex gap-2">
              <a
                href={SOCIAL.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className={iconBtn}
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL.x}
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className={iconBtn}
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={iconBtn}
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2 – Main nav links */}
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-foreground">
              {t("footer.mainLinks")}
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV.map(([seg, key]) => (
                <li key={seg}>
                  <Na
                    href={`/${lang}/${seg}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(key)}
                  </Na>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Help links */}
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-foreground">
              {t("footer.helpLinks")}
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_HELP.map(([seg, key]) => (
                <li key={seg}>
                  <Na
                    href={`/${lang}/${seg}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(key)}
                  </Na>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 – Newsletter */}
          <div>
            <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-foreground">
              {t("footer.newsletter")}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">{t("footer.newsletterDesc")}</p>
            {subscribed ? (
              <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                {t("footer.subscribeOk")}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.emailPlaceholder")}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Send className="h-3.5 w-3.5" />
                  {t("footer.subscribe")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom band: 3 columns ─────────────────────────────────────── */}
      <div className="border-t border-border bg-card/80">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 text-xs text-muted-foreground md:grid-cols-3 md:px-8">
          {/* Left – Executives */}
          <div className="flex flex-col gap-1 md:justify-center">
            <div className="font-semibold text-foreground/80">{t("chrome.chairman")}</div>
            <div className="font-semibold text-foreground/80">{t("chrome.editor")}</div>
          </div>

          {/* Center – Payment icons */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("footer.paymentTitle")}</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <VisaIcon />
              <MastercardIcon />
              <FawryIcon />
              <MezaIcon />
            </div>
          </div>

          {/* Right – Copyright */}
          <div className="flex flex-col items-start gap-1 md:items-end md:justify-center">
            <span>© {new Date().getFullYear()} elCinema</span>
            <span className="text-primary">{t("footer.builtBy")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
