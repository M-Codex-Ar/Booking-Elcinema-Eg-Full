import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { WorkPage } from "@/pages/Work";
import { ManagedWorkPage } from "@/pages/Managed";
import { managedMovieById } from "@/features/content/content";
import { managedContentOptions } from "@/features/content/content.options";
import type { ManagedContent } from "@/features/content/content.functions";
import { movieById, movieBySlug, workId } from "@/lib/build";
import { asLang, makeT } from "@/i18n";

export const Route = createFileRoute("/$lang/work/$id")({
  beforeLoad: ({ params }) => {
    if (!/^\d+$/.test(params.id)) {
      const legacy = movieBySlug.get(params.id);
      if (legacy)
        throw redirect({
          to: "/$lang/work/$id",
          params: { lang: params.lang, id: String(workId(legacy)) },
          replace: true,
        });
    }
  },
  loader: ({ context, params }) =>
    params.id.startsWith("m-") ? context.queryClient.ensureQueryData(managedContentOptions) : null,
  component: WorkRoute,
  head: ({ params, loaderData }) => {
    const lang = asLang(params.lang);
    const movie = params.id.startsWith("m-")
      ? managedMovieById((loaderData ?? null) as ManagedContent | null).get(params.id)
      : (movieById.get(Number(params.id)) ?? movieBySlug.get(params.id));
    const title = movie
      ? `${movie.title[lang]} | elCinema`
      : lang === "ar"
        ? "فيلم | إل سينما"
        : "Movie | elCinema";
    const description =
      movie?.synopsis[lang] ??
      (lang === "ar"
        ? "تفاصيل الفيلم من دليل السينما المحلي."
        : "Movie details from the local cinema catalogue.");
    return {
      meta: [{ title }, { name: "description", content: description.slice(0, 160) }],
    };
  },
});

function WorkRoute() {
  const { lang, id } = Route.useParams();
  const l = asLang(lang);
  const t = makeT(l);
  if (id.startsWith("m-")) return <ManagedWorkLoader lang={l} id={id} />;
  if (movieById.has(Number(id)) || movieBySlug.has(id)) return <WorkPage lang={l} id={id} />;
  return (
    <p className="mx-auto max-w-3xl px-4 py-20 text-center text-lg font-bold">
      {t("work.notFound")}
    </p>
  );
}

function ManagedWorkLoader({ lang, id }: { lang: "en" | "ar"; id: string }) {
  const managed = useSuspenseQuery(managedContentOptions).data;
  const movie = managedMovieById(managed).get(id);
  return movie ? (
    <ManagedWorkPage movie={movie} lang={lang} />
  ) : (
    <p className="mx-auto max-w-3xl px-4 py-20 text-center">{makeT(lang)("work.notFound")}</p>
  );
}
