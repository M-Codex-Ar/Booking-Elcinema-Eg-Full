/** Dashboard: full control panel over the site catalogue (Lovable Cloud).
 * Overview charts + create/edit/delete for movies, people, box office rows,
 * TV channels & programs, videos and featured lists — everything appears on
 * the public pages immediately. */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  CalendarClock,
  Clapperboard,
  ExternalLink,
  Film,
  LayoutDashboard,
  ListVideo,
  LogOut,
  MonitorPlay,
  Play,
  Plus,
  Ticket,
  TrendingUp,
  Tv,
  Users,
} from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "../ThemeToggle";
import {
  BoxOfficeSection,
  ChannelsSection,
  LiveSection,
  MoviesSection,
  PeopleSection,
} from "../dashboard/Sections";
import {
  BoxOfficeManager,
  ChannelsManager,
  ListsManager,
  MoviesManager,
  PeopleManager,
  VideosManager,
} from "../dashboard/editor";
import { Na } from "../ui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { managedContentOptions } from "../content";
import {
  allMovies,
  managedBoxofficeRows,
  managedChannels,
  managedLists,
  managedMovies,
  managedPeople,
  mergedBoxoffice,
  mergedTvGuide,
  managedVideos,
} from "../content";
import { BOXOFFICE, CHANNELS, GENRES, MOVIES, PEOPLE } from "../data";
import type { Lang } from "../home.shared";

const L = (lang: Lang, en: string, ar: string) => (lang === "ar" ? ar : en);
const COLORS = [
  "var(--primary)",
  "var(--gold)",
  "var(--ring)",
  "var(--muted-foreground)",
  "var(--destructive)",
];

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Film;
  label: string;
  value: string | number;
}) {
  return (
    <div className="glass-card min-w-0 rounded-2xl border border-border p-4 sm:p-5">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-3 text-2xl font-black sm:text-3xl">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/** Menu button that also closes the slide-in menu on phones. */
function CloseOnMobile({ children, onClick, ...rest }: React.ComponentProps<"button">) {
  const { setOpenMobile } = useSidebar();
  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        setOpenMobile(false);
      }}
    >
      {children}
    </button>
  );
}

export function DashboardPage({ lang }: { lang: Lang }) {
  const { data: managed } = useQuery(managedContentOptions);
  const [section, setSection] = useState<string>("stats");

  const merged = managed ?? null;
  const managedCount =
    managedMovies(merged).length +
    managedPeople(merged).length +
    managedChannels(merged).length +
    managedVideos(merged).length +
    managedLists(merged).length +
    managedBoxofficeRows(merged).length;

  const genreData = useMemo(() => {
    const c: Record<string, number> = {};
    allMovies(merged).forEach((m) => m.genres.forEach((g) => (c[g] = (c[g] ?? 0) + 1)));
    return Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([g, n], i) => ({ name: GENRES[g]?.[lang] ?? g, n, fill: COLORS[i % COLORS.length] }));
  }, [merged, lang]);
  const boxData = mergedBoxoffice(merged)
    .slice(0, 10)
    .map((b) => ({ name: b.title[lang], m: +(b.weeklyEgp / 1e6).toFixed(2) }));
  const statusData = [
    {
      name: L(lang, "Now playing", "يعرض الآن"),
      value: allMovies(merged).filter((m) => m.status === "now").length,
      fill: COLORS[0],
    },
    {
      name: L(lang, "Coming soon", "قريباً"),
      value: allMovies(merged).filter((m) => m.status === "soon").length,
      fill: COLORS[1],
    },
  ];
  const weekly = mergedBoxoffice(merged).reduce((s, b) => s + b.weeklyEgp, 0);

  const groups = [
    {
      label: L(lang, "Dashboard", "لوحة التحكم"),
      items: [{ id: "stats", icon: LayoutDashboard, label: L(lang, "Overview", "نظرة عامة") }],
    },
    {
      label: L(lang, "Cinema", "السينما"),
      items: [
        { id: "movies", icon: Film, label: L(lang, "Manage movies", "إدارة الأفلام") },
        {
          id: "catalogue",
          icon: Clapperboard,
          label: L(lang, "Built-in catalogue", "الكتالوج الأساسي"),
        },
        { id: "people", icon: Users, label: L(lang, "Manage people", "إدارة الأشخاص") },
        {
          id: "boxoffice",
          icon: TrendingUp,
          label: L(lang, "Manage box office", "إدارة البوكس أوفيس"),
        },
      ],
    },
    {
      label: L(lang, "Watch", "شاهد"),
      items: [
        { id: "tv", icon: Tv, label: L(lang, "Channels & programs", "القنوات والبرامج") },
        { id: "videos", icon: Play, label: L(lang, "Manage videos", "إدارة الفيديوهات") },
        { id: "lists", icon: ListVideo, label: L(lang, "Featured lists", "قوائم مختارة") },
      ],
    },
    {
      label: L(lang, "Live site", "الموقع المباشر"),
      items: [
        { id: "live", icon: ExternalLink, label: L(lang, "View live pages", "صفحات الموقع") },
      ],
    },
  ];
  const nav = groups.flatMap((g) => g.items);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const otherLangPath = pathname.replace(/^\/(en|ar)/, lang === "ar" ? "/en" : "/ar");
  const tip = {
    contentStyle: {
      background: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      color: "var(--popover-foreground)",
    },
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign(`/${lang}`);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Sidebar variant="floating" collapsible="icon" side={lang === "ar" ? "right" : "left"}>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1.5 font-black">
              <LayoutDashboard className="h-5 w-5 shrink-0 text-primary" />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                elCinema {L(lang, "Admin", "الإدارة")}
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {groups.map((g) => (
              <SidebarGroup key={g.label}>
                <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {g.items.map((n) => (
                      <SidebarMenuItem key={n.id}>
                        <SidebarMenuButton
                          isActive={section === n.id}
                          tooltip={n.label}
                          onClick={() => setSection(n.id)}
                          asChild
                        >
                          <CloseOnMobile>
                            <n.icon /> <span>{n.label}</span>
                          </CloseOnMobile>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={L(lang, "Back to site", "العودة للموقع")}>
                  <Na href={`/${lang}`}>
                    <ArrowLeft className="rtl:rotate-180" />{" "}
                    <span>{L(lang, "Back to site", "العودة للموقع")}</span>
                  </Na>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={L(lang, "Sign out", "خروج")}>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="flex w-full items-center gap-2 text-destructive"
                  >
                    <LogOut className="rtl:rotate-180" /> <span>{L(lang, "Sign out", "خروج")}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="min-w-0 md:ms-3">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-6">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-black sm:text-lg">
                {nav.find((n) => n.id === section)?.label}
              </h1>
            </div>
            <Na href={otherLangPath} className="text-sm font-semibold hover:text-primary">
              {lang === "ar" ? "EN" : "عربي"}
            </Na>
            <ThemeToggle lang={lang} />
          </header>
          <main className="min-w-0 flex-1 p-3 sm:p-6">
            {managed === undefined && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {L(lang, "Loading your content…", "جارٍ تحميل المحتوى…")}
              </p>
            )}

            {managed !== undefined && section === "stats" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
                  <Stat
                    icon={Film}
                    label={L(lang, "Movies", "أفلام")}
                    value={MOVIES.length + managedMovies(merged).length}
                  />
                  <Stat
                    icon={Users}
                    label={L(lang, "People", "أشخاص")}
                    value={PEOPLE.length + managedPeople(merged).length}
                  />
                  <Stat
                    icon={Tv}
                    label={L(lang, "TV channels", "قنوات")}
                    value={CHANNELS.length + managedChannels(merged).length}
                  />
                  <Stat
                    icon={Play}
                    label={L(lang, "Videos added", "فيديوهات مضافة")}
                    value={managedVideos(merged).length}
                  />
                  <Stat
                    icon={ListVideo}
                    label={L(lang, "Featured lists", "قوائم مختارة")}
                    value={managedLists(merged).length}
                  />
                  <Stat
                    icon={TrendingUp}
                    label={L(lang, "Weekly box office (EGP M)", "إيراد الأسبوع (مليون ج.م)")}
                    value={(weekly / 1e6).toFixed(1)}
                  />
                </div>
                <div className="glass-card rounded-2xl border border-border p-4 sm:p-5">
                  <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Plus className="h-4 w-4 text-primary" />
                    {L(
                      lang,
                      "Everything you add here appears on the public site right away.",
                      "كل ما تضيفه هنا يظهر على الموقع فورًا.",
                    )}
                    <span className="font-bold text-foreground">
                      {managedCount} {L(lang, "items managed by you", "عنصرًا أضفتموها")}
                    </span>
                  </p>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="glass-card min-w-0 rounded-2xl border border-border p-4 sm:p-5 lg:col-span-2">
                    <h2 className="mb-4 font-bold">
                      {L(
                        lang,
                        "Top 10 weekly box office (EGP millions)",
                        "أعلى 10 إيرادات أسبوعية (مليون جنيه)",
                      )}
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={boxData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--muted-foreground)" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={110}
                          stroke="var(--muted-foreground)"
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip {...tip} />
                        <Bar dataKey="m" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="glass-card min-w-0 rounded-2xl border border-border p-4 sm:p-5">
                    <h2 className="mb-4 font-bold">{L(lang, "Release status", "حالة العرض")}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={100}
                          label
                        />
                        <Tooltip {...tip} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="glass-card min-w-0 rounded-2xl border border-border p-4 sm:p-5">
                  <h2 className="mb-4 font-bold">
                    {L(lang, "Movies by genre", "الأفلام حسب النوع")}
                  </h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={genreData}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="var(--muted-foreground)"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip {...tip} />
                      <Bar dataKey="n" fill="var(--gold)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="glass-card min-w-0 rounded-2xl border border-border p-4 sm:p-5">
                  <h2 className="mb-4 font-bold">
                    {L(lang, "TV guide window", "نافذة جدول القنوات")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {mergedTvGuide(merged).lines.length}{" "}
                    {L(lang, "channel lines in tonight's grid", "قناة في جدول الليلة")} ·{" "}
                    {mergedTvGuide(merged).lines.reduce((s, l) => s + l.slots.length, 0)}{" "}
                    {L(lang, "programs", "برنامجًا")}
                  </p>
                </div>
              </div>
            )}

            {managed !== undefined && section === "movies" && (
              <MoviesManager lang={lang} data={managed} />
            )}
            {managed !== undefined && section === "catalogue" && (
              <div className="space-y-8">
                <MoviesSection lang={lang} />
                <PeopleSection lang={lang} />
              </div>
            )}
            {managed !== undefined && section === "people" && (
              <PeopleManager lang={lang} data={managed} />
            )}
            {managed !== undefined && section === "boxoffice" && (
              <div className="space-y-8">
                <BoxOfficeManager lang={lang} data={managed} />
                <BoxOfficeSection lang={lang} />
              </div>
            )}
            {managed !== undefined && section === "tv" && (
              <div className="space-y-8">
                <ChannelsManager lang={lang} data={managed} />
                <ChannelsSection lang={lang} />
              </div>
            )}
            {managed !== undefined && section === "videos" && (
              <VideosManager lang={lang} data={managed} />
            )}
            {managed !== undefined && section === "lists" && (
              <ListsManager lang={lang} data={managed} />
            )}

            {section === "live" && (
              <div className="grid gap-4 md:grid-cols-2">
                <LiveSection
                  lang={lang}
                  seg="now"
                  title={L(lang, "Now Playing", "السينمات الآن")}
                  text={L(
                    lang,
                    "Merged list: built-in movies plus everything you added.",
                    "قائمة مدموجة: الأفلام الأساسية وكل ما أضفتموه.",
                  )}
                />
                <LiveSection
                  lang={lang}
                  seg="soon"
                  title={L(lang, "Coming Soon", "قريباً")}
                  text={L(
                    lang,
                    "Merged list of upcoming releases.",
                    "قائمة الأفلام القادمة المدموجة.",
                  )}
                />
                <LiveSection
                  lang={lang}
                  seg="tvguide"
                  title={L(lang, "TV Guide", "جدول القنوات")}
                  text={L(
                    lang,
                    "Tonight's grid including your managed channels.",
                    "جدول الليلة يشمل قنواتكم المضافة.",
                  )}
                />
                <LiveSection
                  lang={lang}
                  seg="boxoffice"
                  title={L(lang, "Box Office", "بوكس أوفيس")}
                  text={L(
                    lang,
                    "Weekly revenue table with your added rows.",
                    "جدول الإيرادات الأسبوعي مع صفوفكم المضافة.",
                  )}
                />
                <LiveSection
                  lang={lang}
                  seg="booking"
                  title={L(lang, "Book tickets", "احجز تذاكر")}
                  text={L(lang, "Ticket booking page.", "صفحة حجز التذاكر.")}
                />
                <LiveSection
                  lang={lang}
                  seg="vod"
                  title={L(lang, "Watch Online", "شاهد أونلاين")}
                  text={L(lang, "Streaming platforms guide.", "دليل منصات المشاهدة.")}
                />
                <LiveSection
                  lang={lang}
                  seg="video"
                  title={L(lang, "elCinema TV", "إل سينما TV")}
                  text={L(
                    lang,
                    "Video gallery including your added videos.",
                    "معرض الفيديو يشمل فيديوهاتكم المضافة.",
                  )}
                />
                <LiveSection
                  lang={lang}
                  seg="lineup"
                  title={L(lang, "Featured Lists", "قوائم مختارة")}
                  text={L(lang, "Curated lists including yours.", "القوائم المختارة تشمل قوائمكم.")}
                />
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
