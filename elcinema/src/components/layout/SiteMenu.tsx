/** Compact navigation for viewports below the desktop section menus. */
import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarClock,
  Film,
  ListVideo,
  Menu,
  MonitorPlay,
  Play,
  Ticket,
  TrendingUp,
  Tv,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lang } from "@/types/home";
import { makeT, type CopyKey } from "@/i18n";

type NavItem = { seg: string; icon: typeof Film; label: CopyKey };
export type NavGroup = { label: CopyKey; items: readonly NavItem[] };

/** Shared route map for the desktop and compact menus. */
export const NAV_GROUPS = [
  {
    label: "nav.cinema",
    items: [
      { seg: "now", icon: Film, label: "nav.now" },
      { seg: "soon", icon: CalendarClock, label: "nav.soon" },
      { seg: "booking", icon: Ticket, label: "nav.booking" },
      { seg: "boxoffice", icon: TrendingUp, label: "nav.boxoffice" },
    ],
  },
  {
    label: "nav.watch",
    items: [
      { seg: "tvguide", icon: Tv, label: "nav.tvguide" },
      { seg: "vod", icon: MonitorPlay, label: "nav.vod" },
      { seg: "video", icon: Play, label: "nav.video" },
      { seg: "lineup", icon: ListVideo, label: "nav.lineup" },
    ],
  },
] as const satisfies readonly NavGroup[];

export function SiteMenu({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const go = (seg: string) => void navigate({ to: `/${lang}/${seg}` as never });
  // The trigger icon belongs to the open state: hamburger while closed, the
  // related close glyph while open — not a rotated hamburger.
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={t("chrome.menu")}
        className="group flex h-9 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:border-primary data-[state=open]:text-primary lg:hidden"
      >
        {open ? (
          <X className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Menu className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{open ? t("chrome.close") : t("chrome.menu")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(92vw,26rem)] border-border bg-popover p-2"
      >
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {NAV_GROUPS.map((group) => (
            <section key={group.label} aria-label={t(group.label)}>
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                {t(group.label)}
              </DropdownMenuLabel>
              {group.items.map((item) => (
                <DropdownMenuItem
                  key={item.seg}
                  onSelect={() => go(item.seg)}
                  aria-current={
                    pathname === `/${lang}/${item.seg}` ||
                    pathname.startsWith(`/${lang}/${item.seg}/`)
                      ? "page"
                      : undefined
                  }
                  className="cursor-pointer gap-2 rounded-lg py-2 font-semibold"
                >
                  <item.icon className="h-4 w-4 text-primary group-data-[highlighted]:text-primary-foreground" />
                  {t(item.label)}
                </DropdownMenuItem>
              ))}
            </section>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
