/** Hamburger dropdown with every elCinema section, like the real site's menu. */
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarClock,
  Film,
  ListVideo,
  Menu,
  MonitorPlay,
  Play,
  Search,
  Ticket,
  TrendingUp,
  Tv,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lang } from "./home.shared";

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
      { seg: "dashboard", icon: LayoutDashboard, en: "Dashboard", ar: "لوحة التحكم" },
    ],
  },
] as const;

export function SiteMenu({ lang }: { lang: Lang }) {
  const navigate = useNavigate();
  const go = (seg: string) => void navigate({ to: `/${lang}/${seg}` as never });
  return (
    <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"}>
      <DropdownMenuTrigger
        aria-label={lang === "ar" ? "القائمة" : "Menu"}
        className="group flex h-9 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary data-[state=open]:border-primary data-[state=open]:text-primary"
      >
        <Menu className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-90" />
        <span className="hidden sm:inline">{lang === "ar" ? "القائمة" : "Menu"}</span>
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
          <Search className="h-4 w-4 text-primary" />{" "}
          {lang === "ar" ? "بحث متقدم" : "Search the catalogue"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
