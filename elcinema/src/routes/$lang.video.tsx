import { Outlet, createFileRoute } from "@tanstack/react-router";

// Layout for /$lang/video and its child detail route (/video/$id).
export const Route = createFileRoute("/$lang/video")({
  component: () => <Outlet />,
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
      <p className="text-lg font-bold">Page not found</p>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "elCinema TV — Video Gallery | elCinema" },
      {
        name: "description",
        content: "Trailers, series episodes, songs and behind-the-scenes videos, updated daily.",
      },
      { property: "og:title", content: "elCinema TV — Video Gallery | elCinema" },
      {
        property: "og:description",
        content: "Trailers, series episodes, songs and behind-the-scenes videos, updated daily.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
