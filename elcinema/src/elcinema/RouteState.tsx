/**
 * The two panels every route needs when it cannot render: a missing page and a
 * failed one.
 *
 * Before this existed each of the ~15 route files drew its own
 * `max-w-3xl px-4 py-20` block with English-only copy, so an Arabic reader hit a
 * Latin error page and any wording change was fifteen edits. One component here,
 * styled through `StatePanel`, reads the edition from the URL — a route's
 * `errorComponent` receives only the error, not the params it was built from.
 */
import { useRouterState } from "@tanstack/react-router";
import { Clapperboard, TriangleAlert } from "lucide-react";
import type { CopyKey } from "./i18n";
import { langFromPath, makeT } from "./i18n";
import { CtaLink, StatePanel } from "./components/primitives";

/** The home link is the one recovery action every edition can offer. */
function HomeAction() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = makeT(langFromPath(pathname));
  return (
    <CtaLink href={`/${langFromPath(pathname)}`} size="sm">
      {t("common.goHome")}
    </CtaLink>
  );
}

/**
 * `title` is a key, not a string: the caller says which kind of thing was not
 * found (movie, person, list…) and the copy stays in `i18n.ts` with the rest.
 */
export function RouteNotFound({ titleKey = "common.notFoundPage" }: { titleKey?: CopyKey }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = makeT(langFromPath(pathname));
  return (
    <StatePanel
      icon={<Clapperboard />}
      title={t(titleKey)}
      message={t("common.notFoundHint")}
      action={<HomeAction />}
    />
  );
}

export function RouteError({ error }: { error: unknown }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = makeT(langFromPath(pathname));
  return (
    <StatePanel
      icon={<TriangleAlert />}
      title={t("common.couldntLoad")}
      message={error instanceof Error ? error.message : String(error)}
      action={<HomeAction />}
    />
  );
}
