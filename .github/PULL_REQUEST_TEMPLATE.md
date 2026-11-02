## What changes and why

<!-- One paragraph. The reason belongs here; the diff already shows the what. -->

## Linked issue

Closes #

## Type of change

- [ ] Feature
- [ ] Fix
- [ ] Refactor (no behaviour change)
- [ ] Docs
- [ ] Build / CI / scripts

## Area

- [ ] `elcinema/` public pages
- [ ] `elcinema/` dashboard
- [ ] Design system (`src/theme`, `components/variants.ts`, primitives, `i18n.ts`)
- [ ] Data layer (`content.ts`, server functions, migrations)
- [ ] `server-api/` (spec only until approved)
- [ ] `.github/`, `docs/`, `scripts/`

## Verification

Paste the real output, not an intention.

```
npm run check:web
```

- [ ] `format:check`, `lint`, `typecheck`, `test`, `build` all pass
- [ ] New/changed logic has a test, or this note explains why not:
- [ ] Rendered in **English** and **Arabic** (RTL) — screenshots attached for visual changes
- [ ] Checked in **dark** and **light** themes
- [ ] Keyboard path verified (focus visible, accessible names present)

## Guardrails respected

- [ ] No literal colour, shadow, radius or font-size outside `src/theme/` and `components/variants.ts`
- [ ] No inline `lang === "ar" ? …` copy — strings come from `i18n.ts`
- [ ] Logical properties only (`ms-/me-/start-/end-/rtl:`), no physical axis classes
- [ ] Scraped hrefs resolved through `cardLink`; internal navigation through the router
- [ ] Operator writes go through the auth-guarded server function
- [ ] `elcinema/` published history untouched (no force-push, rebase, amend or squash)

## Rollback

<!-- How to undo this if it ships badly: revert commit, flag off, migration down step. -->
