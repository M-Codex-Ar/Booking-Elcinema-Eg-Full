import { Outlet, createFileRoute } from "@tanstack/react-router";

// Layout for /$lang/booking and its child detail route (/booking/$id).
export const Route = createFileRoute("/$lang/booking")({
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
      { title: "Book tickets | elCinema" },
      {
        name: "description",
        content: "Cinemas and showtimes for every movie now playing in Egypt.",
      },
      { property: "og:title", content: "Book tickets | elCinema" },
      {
        property: "og:description",
        content: "Cinemas and showtimes for every movie now playing in Egypt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
