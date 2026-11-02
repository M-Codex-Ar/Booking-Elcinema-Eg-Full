import { Outlet, createFileRoute } from "@tanstack/react-router";

// Layout for /$lang/lineup and its child detail route (/lineup/$id).
export const Route = createFileRoute("/$lang/lineup")({
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
      { title: "Featured Lists | elCinema" },
      { name: "description", content: "Curated movies and series lists by the elCinema editors." },
      { property: "og:title", content: "Featured Lists | elCinema" },
      {
        property: "og:description",
        content: "Curated movies and series lists by the elCinema editors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
