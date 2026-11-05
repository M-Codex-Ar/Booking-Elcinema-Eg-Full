# ADR 0001 — TanStack Start on Vite/Nitro, deployed to Cloudflare

Status: accepted (inherited; recorded 2026-11-02)

## Context

The app arrived from a Lovable-generated TanStack Start template and is already
deployed. It needs server-side managed-content reads, SSR for both language
editions — and it needs the SEO that server
rendering gives a public content site. The realistic alternatives were Next.js,
Remix/React Router 7, or a client-only SPA with a separate API.

## Decision

Keep TanStack Start 1.168 with TanStack Router 1.170 and Query, built by Vite 8
and served through Nitro with Cloudflare as the target. The build config comes from
`@lovable.dev/vite-tanstack-config`, which wires the Start, React, Tailwind,
tsconfig-paths, nitro and env plugins; `vite.config.ts` adds only the server entry
redirect to `src/server.ts`.

## Consequences

- SSR, route loaders and `createServerFn` are the same primitive, so a data
  boundary stays inside TypeScript — no hand-written HTTP client, and no CORS
  surface. Cheap to keep doing.
- Server code is reachable only through a server function or a `.server.ts` module;
  anything imported by a page is shipped to the browser. This makes the
  "never put a secret in `VITE_`" rule load-bearing rather than stylistic.
- `src/routeTree.gen.ts` is committed and imported directly, so a route rename
  without regeneration compiles in dev and breaks in production. CI now fails on
  that drift ([../.github/workflows/web-ci.yml](../../.github/workflows/web-ci.yml)).
- The Lovable plugin owns plugin composition: adding `tanstackStart`, `viteReact`,
  `tailwindcss` or `tsConfigPaths` by hand duplicates them and breaks the build.
  `vite.config.ts` says so at the top; respect the comment.
- Switching frameworks later means rewriting routes, loaders and server functions
  at once. Accepted: the template is what the connected project syncs with, and
  fighting it would cost more than it returns.
