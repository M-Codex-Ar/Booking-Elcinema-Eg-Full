import { createFileRoute, notFound, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteFooter, SiteHeader } from "@/elcinema/SiteChrome";
import type { Lang } from "@/elcinema/home.shared";

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

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="min-h-screen bg-background">
      {!isDashboard && <SiteHeader lang={l} />}
      <Outlet />
      {!isDashboard && <SiteFooter lang={l} />}
    </div>
  );
}
