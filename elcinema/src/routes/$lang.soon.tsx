import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/pages/ComingSoon";
import { managedContentOptions, mergedComingSoon } from "@/content";
import { asLang } from "@/i18n";
import type { ViewMode } from "@/controls";

export const Route = createFileRoute("/$lang/soon")({
  validateSearch: (search: Record<string, unknown>) => ({
    genre: typeof search["genre"] === "string" ? search["genre"] : undefined,
    sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
    view:
      search["view"] === "list"
        ? ("list" as ViewMode)
        : search["view"] === "grid"
          ? ("grid" as ViewMode)
          : undefined,
    page:
      typeof search["page"] === "string" && /^\d+$/.test(search["page"])
        ? Number(search["page"])
        : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managedContentOptions),
  component: SoonRoute,
  head: ({ params }) => {
    const en = params.lang !== "ar";
    const title = en ? "Coming Soon | elCinema" : "قريباً | إل سينما";
    const description = en
      ? "Upcoming movies in Egyptian cinemas, sortable and filterable."
      : "أفلام قادمة إلى السينمات المصرية، مع خيارات ترتيب وفلترة.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function SoonRoute() {
  const { lang } = Route.useParams();
  const { genre, sort, view, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setSearch = (patch: Record<string, string | number | undefined>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  const managed = Route.useLoaderData();
  return (
    <ComingSoonPage
      lang={asLang(lang)}
      list={mergedComingSoon(managed)}
      genre={genre}
      sort={sort}
      view={view}
      page={page}
      setSearch={setSearch}
    />
  );
}
