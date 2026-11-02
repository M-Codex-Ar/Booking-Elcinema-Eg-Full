import { createFileRoute, redirect } from "@tanstack/react-router";

/** `/` redirects to the English edition at `/en`. */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/$lang", params: { lang: "en" } });
  },
});
