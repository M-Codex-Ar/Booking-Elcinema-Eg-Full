import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { movieBySlug, personId, workId } from "@/elcinema/build";
import { MOVIES, PEOPLE } from "@/elcinema/data";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the language-prefixed pages for both editions", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    for (const path of [
      "/en",
      "/ar",
      "/en/now",
      "/ar/soon",
      "/en/tvguide",
      "/ar/boxoffice",
      "/en/search",
    ]) {
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId, path).not.toBe(rootRouteId);
    }
  });

  it("matches movie and person detail pages addressed by numeric ID", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const movie = MOVIES[0]!;
    const person = PEOPLE[0]!;
    const work = workId(movie);
    const pid = personId(person);

    for (const path of [
      `/en/work/${work}`,
      `/ar/work/${work}`,
      `/en/person/${pid}`,
      `/ar/person/${pid}`,
    ]) {
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId, path).not.toBe(rootRouteId);
    }
  });

  it("still matches legacy slug URLs so old links keep working", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    for (const path of [
      `/en/work/${movieBySlug.get(MOVIES[0]!.slug)!.slug}`,
      `/ar/work/${MOVIES[1]!.slug}`,
      `/en/person/${PEOPLE[0]!.slug}`,
    ]) {
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId, path).not.toBe(rootRouteId);
    }
  });
});
