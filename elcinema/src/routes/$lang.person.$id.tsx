import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PersonPage } from "@/pages/Person";
import { ManagedPersonPage } from "@/pages/Managed";
import { managedPeople, managedPersonById, managedRef } from "@/features/content/content";
import { managedContentOptions } from "@/features/content/content.options";
import type { ManagedContent } from "@/features/content/content.functions";
import { personById, personBySlug, personId } from "@/lib/build";
import { asLang, makeT } from "@/i18n";

export const Route = createFileRoute("/$lang/person/$id")({
  beforeLoad: ({ params }) => {
    if (!/^\d+$/.test(params.id)) {
      const legacy = personBySlug.get(params.id);
      if (legacy)
        throw redirect({
          to: "/$lang/person/$id",
          params: { lang: params.lang, id: String(personId(legacy)) },
          replace: true,
        });
    }
  },
  loader: ({ context, params }) =>
    params.id.startsWith("m-") ? context.queryClient.ensureQueryData(managedContentOptions) : null,
  component: PersonRoute,
  head: ({ params, loaderData }) => {
    const lang = asLang(params.lang);
    const managedRow = params.id.startsWith("m-")
      ? managedPeople((loaderData ?? null) as ManagedContent | null).find(
          (row) => managedRef(row) === params.id,
        )
      : undefined;
    const sample = personById.get(Number(params.id)) ?? personBySlug.get(params.id);
    const name = managedRow
      ? lang === "ar"
        ? managedRow.name_ar || managedRow.name_en
        : managedRow.name_en
      : sample?.name[lang];
    const title = name
      ? `${name} | elCinema`
      : lang === "ar"
        ? "شخصية | إل سينما"
        : "Person | elCinema";
    return {
      meta: [{ title }, { name: "description", content: name ?? "Local catalogue profile" }],
    };
  },
});

function PersonRoute() {
  const { lang, id } = Route.useParams();
  const l = asLang(lang);
  const t = makeT(l);
  if (id.startsWith("m-")) return <ManagedPersonLoader lang={l} id={id} />;
  if (personById.has(Number(id)) || personBySlug.has(id)) return <PersonPage lang={l} id={id} />;
  return (
    <p className="mx-auto max-w-3xl px-4 py-20 text-center text-lg font-bold">
      {t("person.notFound")}
    </p>
  );
}

function ManagedPersonLoader({ lang, id }: { lang: "en" | "ar"; id: string }) {
  const managed = useSuspenseQuery(managedContentOptions).data;
  const person = managedPersonById(managed).get(id);
  const bio = managedPeople(managed).find((row) => managedRef(row) === id)?.bio;
  return person ? (
    <ManagedPersonPage person={person} bio={bio || undefined} lang={lang} />
  ) : (
    <p className="mx-auto max-w-3xl px-4 py-20 text-center">{makeT(lang)("person.notFound")}</p>
  );
}
