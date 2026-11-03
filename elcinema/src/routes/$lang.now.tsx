import { createFileRoute } from "@tanstack/react-router";
import { NowPlayingPage } from "@/pages/NowPlaying";
import { managedContentOptions, mergedNowPlaying } from "@/features/content/content";
import { asLang } from "@/i18n";
import type { ViewMode } from "@/components/shared/controls";

export const Route = createFileRoute("/$lang/now")({
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
  component: NowRoute,
  head: ({ params }) => {
    const en = params.lang !== "ar";
    const title = en ? "Now Playing | elCinema" : "السينمات الآن | إل سينما";
    const description = en
      ? "All movies playing in Egyptian cinemas this week, filterable by genre."
      : "كل الأفلام المعروضة في السينمات المصرية هذا الأسبوع، مع فلترة حسب النوع.";
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

function NowRoute() {
  const { lang } = Route.useParams();
  const { genre, sort, view, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setSearch = (patch: Record<string, string | number | undefined>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  const managed = Route.useLoaderData();
  return (
    <NowPlayingPage
      lang={asLang(lang)}
      list={mergedNowPlaying(managed)}
      genre={genre}
      sort={sort}
      view={view}
      page={page}
      setSearch={setSearch}
    />
  );
}
