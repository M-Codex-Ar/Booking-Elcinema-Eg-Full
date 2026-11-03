/**
 * Person detail — bilingual profile with the person's filmography, following
 * the real elcinema.com /person/<id>/ page: name, role, and the works they
 * are known for, each addressed by the elCinema-style numeric ID.
 */
import { Film, UserRound } from "lucide-react";
import { movieBySlug, personById, personBySlug, workId } from "../build";
import { Na, PosterArt, fmtDate, workPath } from "../ui";
import type { Lang, Movie, Person } from "../home.shared";
import { makeT } from "../i18n";

function personBySlugOrId(id: string) {
  if (/^\d+$/.test(id)) return personById.get(Number(id)) ?? personBySlug.get(id);
  return personBySlug.get(id);
}

export function PersonPage({ lang, id }: { lang: Lang; id: string }) {
  const t = makeT(lang);
  const person = personBySlugOrId(id);
  if (!person) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <UserRound className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-black">{t("person.notFound")}</h1>
        <Na
          href={`/${lang}/now`}
          className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
        >
          {t("now.title")}
        </Na>
      </div>
    );
  }

  const name = person.name[lang];
  const knownFor = person.knownFor
    .map((s) => movieBySlug.get(s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <div>
      {/* Header */}
      <div className="glass-card cinema-gradient mx-auto mt-8 max-w-5xl">
        <div className="flex flex-col items-center gap-6 p-6 text-center md:flex-row md:p-10 md:text-start">
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
            <PosterArt
              hue={hashHue(person)}
              title={person.name.en}
              icon={UserRound}
              img={person.photo}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-black md:text-4xl">{name}</h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm md:justify-start">
              <span className="rounded-full bg-secondary px-3 py-1 font-semibold">
                {person.role[lang]}
              </span>
              <span className="rounded-full border border-border px-3 py-1 font-bold text-muted-foreground">
                {knownFor.length} {t("person.works")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
            <Film className="h-5 w-5 text-primary" /> {t("person.filmography")}
          </h2>
          <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-6">
            {knownFor.map((m) => (
              <FilmCard key={m.slug} movie={m} lang={lang} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FilmCard({ movie, lang }: { movie: Movie; lang: Lang }) {
  return (
    <Na href={workPath(lang, workId(movie))} className="group w-full max-w-40">
      <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
        <PosterArt hue={movie.hue} title={movie.title[lang]} img={movie.poster} />
      </div>
      <h3 className="mt-2 line-clamp-1 text-xs font-bold transition-colors group-hover:text-primary">
        {movie.title[lang]}
      </h3>
      <div className="text-meta text-muted-foreground">{fmtDate(movie.release, lang)}</div>
    </Na>
  );
}

/** Stable poster hue derived from the person's slug. */
function hashHue(p: Person): number {
  let h = 5381;
  for (const c of p.slug) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return h % 360;
}
