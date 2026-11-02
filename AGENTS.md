# Repository instructions for agents

These rules apply to the whole repository. Area-specific rules live in
[`elcinema/AGENTS.md`](elcinema/AGENTS.md).

## Layout and ownership

| Path | Owns | Never put here |
| --- | --- | --- |
| `elcinema/src/theme/` | Design tokens and CSS utilities | Component markup, feature copy |
| `elcinema/src/elcinema/components/` | UI primitives + `cva` recipes | Data fetching, page-specific business rules |
| `elcinema/src/elcinema/pages/` | Page composition | Re-usable visual recipes |
| `elcinema/src/elcinema/i18n.ts` | All UI copy | Domain data (movie titles travel as `Bi` values) |
| `elcinema/src/elcinema/content.ts` | Merge rules for operator + built-in content | Direct table queries from pages |
| `elcinema/src/routes/` | Thin route wiring: params → data → component | Formatting, filtering, merge logic |
| `server-api/` | ASP.NET Core API (spec first, code when approved) | Frontend code, secrets |
| `docs/` | Architecture, contracts, ADRs | Duplicated README boilerplate |
| `scripts/` | Repeatable developer commands | One-off experiments |

## Commands

```sh
npm run check:web            # lint + typecheck + tests + build (the acceptance gate)
npm run dev:web              # frontend dev server
cd elcinema && bun run test  # vitest, 51+ tests must stay green
```

Verify with the real tools before claiming work is done: `tsc --noEmit`, `vitest run`,
`vite build`. A build that succeeds proves compilation, not rendering.

## Non-negotiables

1. **Lovable-connected history.** `elcinema/` syncs with a published Lovable project. Never
   force-push, rebase, amend or squash commits already pushed there.
2. **No new backend code without a green light.** `server-api/` is documentation-only until the
   owner approves the implementation phase.
3. **Centralised styling.** Visual recipes live in `elcinema/src/theme/` and
   `elcinema/src/elcinema/components/variants.ts`. Do not add a literal `oklch`/`hsl`/`#hex`,
   an arbitrary `shadow-[...]`, a `text-[10px]`, or a one-off CSS file in a feature folder.
4. **Bilingual by construction.** Every rendered string comes from `i18n.ts` (`makeT(lang)`) or a
   `Bi` data value. No `lang === "ar" ? … : …` inline in JSX.
5. **RTL is the default assumption.** Use logical properties (`ms-`, `me-`, `start-`, `end-`,
   `text-start`) and `rtl:` variants. Never `ml-`/`mr-`/`left-`/`right-` for layout.
6. **Scraped hrefs go through `cardLink`.** Nothing else may navigate the app to elcinema.com.
7. **Operator writes stay server-side.** Dashboard mutations must call the auth-guarded server
   function, never the Supabase client directly.

## Definition of done for a change

- `npm run check:web` passes (format, lint, typecheck, tests, build).
- New/changed UI renders in both languages and both themes, with keyboard focus visible.
- Copy added to `i18n.ts`, not inline.
- Styles expressed as tokens/primitives, not literals.
- Docs touched when behaviour or structure changed (see the doc that owns the topic in
  [`docs/README.md`](docs/README.md)).
