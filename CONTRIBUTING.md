# Contributing

## Getting set up

```sh
git clone <this-repository-url>
cd unified-control-center
./scripts/setup.sh          # or .\scripts\setup.ps1
cp elcinema/.env.example elcinema/.env
./scripts/dev.sh
```

`elcinema/.env` is ignored by git. Never commit a real key — even a publishable one — see
[SECURITY.md](SECURITY.md).

## Branches, commits, pull requests

- Branch from `main` as `<type>/<short-scope>`: `feat/profile-avatar-upload`,
  `fix/oauth-stateless`, `docs/backend-contract`.
- Commit messages follow Conventional Commits with a scope:
  `feat(dashboard): add box-office row editor`, `fix(i18n): Arabic rail labels fall back to English`.
  One logical change per commit; the reason belongs in the body, not the subject.
- Keep `elcinema/` history linear and **never rewrite commits already pushed** — the folder is
  synced with a Lovable project.
- PRs: fill in `.github/PULL_REQUEST_TEMPLATE.md`, link the issue, and include the verification
  output (`npm run check:web`) plus a screenshot for any visual change, in both languages.

## Before you open a PR

```sh
npm run check:web
```

That runs, in order: Prettier check, ESLint, `tsc --noEmit`, Vitest, production build. Fix the
cause of a failure; do not silence a rule or delete a test to get green.

## Review expectations

- **Structure:** does the change respect the layer boundaries in [AGENTS.md](AGENTS.md)?
- **Styling:** tokens and primitives only; no literal colours or arbitrary shadows.
- **Copy:** strings in `i18n/`; both languages present; `{placeholders}` documented.
- **RTL/a11y:** logical properties, accessible names, focus visible, contrast in both themes.
- **Data:** merge rules in `content.ts`; mutations through the guarded server function.
- **Tests:** new pure logic gets a unit test; parser changes get a fixture-based test.

## Style notes

- TypeScript strict mode is on, including `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes` — optional props that can receive `undefined` must say so.
- Prefer `cn()` from `elcinema/src/lib/utils.ts` over template-string concatenation.
- Route-path casts (`as never`) are confined to `elcinema/src/elcinema/components/primitives.tsx`.
