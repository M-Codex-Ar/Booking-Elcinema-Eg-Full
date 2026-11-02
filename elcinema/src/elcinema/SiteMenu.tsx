/** Hamburger dropdown with every elCinema section, like the real site's menu. */
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarClock,
  Film,
  ListVideo,
  LogIn,
  LogOut,
  Menu,
  MonitorPlay,
  Play,
  Search,
  Ticket,
  TrendingUp,
  Tv,
  User,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lang } from "./home.shared";
import { makeT } from "./i18n";
import { AuthDialog } from "./AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { isAdmin, getUserDisplayName } from "./auth";

/** Header menu groups, shared by the desktop dropdown buttons and the hamburger menu. */
export const NAV_GROUPS = [
  {
    en: "Cinema",
    ar: "السينما",
    items: [
      { seg: "now", icon: Film, en: "Now Playing", ar: "السينمات الآن" },
      { seg: "soon", icon: CalendarClock, en: "Coming Soon", ar: "قريباً" },
      { seg: "booking", icon: Ticket, en: "Book tickets", ar: "احجز تذاكر" },
      { seg: "boxoffice", icon: TrendingUp, en: "Box Office", ar: "بوكس أوفيس" },
    ],
  },
  {
    en: "Watch",
    ar: "شاهد",
    items: [
      { seg: "tvguide", icon: Tv, en: "TV Guide", ar: "جدول القنوات" },
      { seg: "vod", icon: MonitorPlay, en: "Watch Online", ar: "شاهد أونلاين" },
      { seg: "video", icon: Play, en: "elCinema TV", ar: "إل سينما TV" },
      { seg: "lineup", icon: ListVideo, en: "Featured Lists", ar: "قوائم مختارة" },
    ],
  },
] as const;

export function SiteMenu({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setCurrentUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setCurrentUser(session?.user ?? null);
    });
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

  const go = (seg: string) => void navigate({ to: `/${lang}/${seg}` as never });

  return (
    <>
      <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"}>
        <DropdownMenuTrigger
          aria-label={t("chrome.menu")}
          className="group flex h-9 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary data-[state=open]:border-primary data-[state=open]:text-primary"
        >
          <Menu className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-90" />
          <span className="hidden sm:inline">{t("chrome.menu")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[min(92vw,26rem)] border-border bg-popover p-2"
        >
          <div className="grid grid-cols-2 gap-1">
            {NAV_GROUPS.map((g) => (
              <div key={g.en}>
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  {g[lang]}
                </DropdownMenuLabel>
                {g.items.map((it) => (
                  <DropdownMenuItem
                    key={it.seg}
                    onSelect={() => go(it.seg)}
                    className="cursor-pointer gap-2 rounded-lg py-2 font-semibold focus:bg-accent focus:text-primary"
                  >
                    <it.icon className="h-4 w-4 text-primary" /> {it[lang]}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => go("search")}
            className="cursor-pointer gap-2 rounded-lg py-2 font-semibold focus:bg-accent focus:text-primary"
          >
            <Search className="h-4 w-4 text-primary" /> {t("chrome.advancedSearch")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("auth.account")}
          </DropdownMenuLabel>
          {signedIn ? (
            <>
              {admin ? (
                <DropdownMenuItem
                  onSelect={() => go("dashboard")}
                  className="cursor-pointer gap-2 rounded-lg py-2 font-semibold focus:bg-accent focus:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" /> {t("chrome.dashboard")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled
                  className="cursor-default gap-2 rounded-lg py-2 font-semibold text-muted-foreground opacity-90"
                >
                  <User className="h-4 w-4 text-primary" /> {displayName || t("auth.userRole")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={signOut}
                className="cursor-pointer gap-2 rounded-lg py-2 font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="h-4 w-4" /> {t("chrome.signOut")}
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              onSelect={() => setAuthOpen(true)}
              className="cursor-pointer gap-2 rounded-lg py-2 font-semibold text-primary focus:bg-accent focus:text-primary"
            >
              <LogIn className="h-4 w-4 text-primary" /> {t("auth.loginOrRegister")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} lang={lang} />
    </>
  );
}
