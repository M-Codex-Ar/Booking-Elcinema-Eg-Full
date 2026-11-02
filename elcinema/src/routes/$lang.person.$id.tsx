import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getLivePersonFn } from "@/elcinema/live.functions";
import { LiveError } from "@/elcinema/live-ui";
import { LivePersonPage } from "@/elcinema/pages/LivePerson";
import { PersonPage } from "@/elcinema/pages/Person";
import { ManagedPersonPage } from "@/elcinema/Managed";
import {
  managedContentOptions,
  managedPeople,
  managedPersonById,
  managedRef,
} from "@/elcinema/content";
import type { ManagedContent } from "@/elcinema/content.functions";
import { personById, personBySlug, personId } from "@/elcinema/build";
import type { Lang } from "@/elcinema/home.shared";

const livePersonOptions = (lang: Lang, id: string) =>
  queryOptions({
    queryKey: ["elcinema-live-person", lang, id],
    queryFn: () => getLivePersonFn({ data: { lang, id } }),
    staleTime: 10 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/person/$id")({
  // Legacy person slugs (/en/person/karim-el-dessouki) redirect to the
  // canonical numeric URL (/en/person/2256417).
  beforeLoad: ({ params }) => {
    if (!/^\d+$/.test(params.id)) {
      const legacy = personBySlug.get(params.id);
      if (legacy) {
        throw redirect({
          to: "/$lang/person/$id",
          params: { lang: params.lang, id: String(personId(legacy)) },
          replace: true,
        });
      }
    }
  },
  // Built-in sample people render from the catalogue, dashboard-added people
  // ("m-…") from the managed content, and every other numeric person id is
  // fetched live from elcinema.com (English or Arabic edition).
  loader: ({ context, params }) => {
    if (params.id.startsWith("m-"))
      return context.queryClient.ensureQueryData(managedContentOptions);
    if (!/^\d+$/.test(params.id) || personById.has(Number(params.id))) return null;
    const lang: Lang = params.lang === "ar" ? "ar" : "en";
    return context.queryClient.ensureQueryData(livePersonOptions(lang, params.id));
  },
  component: PersonRoute,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-lg font-bold">This page didn't load.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-lg font-bold">Person not found</p>
    </div>
  ),
  head: ({ params, loaderData }) => {
    const en = params.lang !== "ar";
    const managedRow = params.id.startsWith("m-")
      ? managedPeople((loaderData ?? null) as ManagedContent | null).find(
          (r) => managedRef(r) === params.id,
        )
      : undefined;
    const sample =
      !managedRow && /^\d+$/.test(params.id)
        ? personById.get(Number(params.id))
        : !managedRow
          ? personBySlug.get(params.id)
          : undefined;
    const live =
      sample || managedRow
        ? null
        : ((
            loaderData as { data?: { name: string; bio?: string | null } | null } | null | undefined
          )?.data ?? null);
    const title = managedRow
      ? `${managedRow.name_en} | elCinema`
      : sample
        ? `${sample.name[en ? "en" : "ar"]} | elCinema`
        : live
          ? `${live.name} | elCinema`
          : en
            ? "Person | elCinema"
            : "شخصية | إل سينما";
    const description = managedRow
      ? `${managedRow.name_en} — ${managedRow.role_en || "Actor"}`
      : sample
        ? `${sample.name[en ? "en" : "ar"]} — ${sample.role[en ? "en" : "ar"]}`
        : live
          ? `${live.name}${live.bio ? ` — ${live.bio.slice(0, 140)}` : ""}`
          : en
            ? "Actor and filmmaker profiles from Egypt's cinema guide."
            : "ملفات الشخصيات وصناع السينما من دليل السينما المصري.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function PersonRoute() {
  const { lang, id } = Route.useParams();
  const l: Lang = lang === "ar" ? "ar" : "en";
  if (id.startsWith("m-")) return <ManagedPersonLoader lang={l} id={id} />;
  if (!/^\d+$/.test(id) || personById.has(Number(id))) {
    return <PersonPage lang={l} id={id} />;
  }
  return <LivePersonLoader lang={l} id={id} />;
}

function ManagedPersonLoader({ lang, id }: { lang: Lang; id: string }) {
  const managed = useSuspenseQuery(managedContentOptions).data;
  const person = managedPersonById(managed).get(id);
  if (!person) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-bold">Person not found</p>
      </div>
    );
  }
  const bio = managedPeople(managed).find((r) => managedRef(r) === id)?.bio;
  return <ManagedPersonPage person={person} bio={bio ? bio : undefined} lang={lang} />;
}

function LivePersonLoader({ lang, id }: { lang: Lang; id: string }) {
  const result = useSuspenseQuery(livePersonOptions(lang, id)).data;
  if (result.error || !result.data) {
    return <LiveError message={result.error ?? ""} lang={lang} />;
  }
  return <LivePersonPage data={result.data} lang={lang} />;
}
