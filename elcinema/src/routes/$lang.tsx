import { createFileRoute, notFound, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PageAssist } from "@/components/layout/PageAssist";
import type { Lang } from "@/types/home";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (params.lang !== "en" && params.lang !== "ar") throw notFound();
  },
  component: LangLayout,
});

/**
 * Language shell: header, footer and the document direction. The dir
 * attribute lives on a wrapper div (and is mirrored onto <html> after
 * hydration) so logical Tailwind properties (ms-, start-, end-) flip for
 * the Arabic edition.
 *
 * The shell is a full-height flex column with the page in a growing `<main>`,
 * which is what keeps the footer pinned to the bottom of the viewport on short
 * pages (search, auth, an empty list) instead of floating under the content.
 * `page-flow` is what makes that safe: without it a centred `mx-auto` section
 * inside the column sizes to its content rather than the screen, and the tail of
 * every page runs past a phone. The dashboard keeps its own shell — it brings
 * its header, footer and `<main>` landmark, so it must not be wrapped twice.
 */
function LangLayout() {
  const { lang } = Route.useParams();
  const l = lang as Lang;
  const rtl = l === "ar";
  const isDashboard = useRouterState({
    select: (s) => /\/dashboard\/?$/.test(s.location.pathname),
  });

  useEffect(() => {
    document.documentElement.lang = l;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [l, rtl]);

  if (isDashboard) return <DashboardLayout dirLabel={rtl ? "rtl" : "ltr"} />;

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="page-background flex min-h-screen w-full flex-col overflow-x-clip"
    >
      <SiteHeader lang={l} />
      <main className="page-flow flex flex-1 flex-col overflow-x-clip">
        <Outlet />
      </main>
      <SiteFooter lang={l} />
      <PageAssist lang={l} />
    </div>
  );
}

/** Dashboard routes render their own frame; the site chrome stays out of the way. */
function DashboardLayout({ dirLabel }: { dirLabel: "rtl" | "ltr" }) {
  return (
    <div dir={dirLabel} className="page-background min-h-screen">
      <Outlet />
    </div>
  );
}
