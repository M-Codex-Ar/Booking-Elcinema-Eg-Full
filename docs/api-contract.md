# API contract

The interface between `elcinema/` and `server-api/`. Written **before** the
backend exists so both sides can be built against the same shape, and so migrating
one endpoint at a time is possible. This is a target contract — nothing here is
live yet ([backend.md](backend.md)).

## Conventions

| Item | Rule |
| --- | --- |
| Base path | `/api/v1` — breaking changes require `/api/v2`, never a redefinition |
| Format | JSON, UTF-8, `camelCase` property names |
| Language | Bilingual fields travel together; `lang` is a rendering concern, not a separate resource |
| Dates | ISO 8601, UTC (`2026-11-02T18:00:00Z`); day-only values as `YYYY-MM-DD` |
| Times in a day | Integer minutes from midnight (`0`–`1440`), matching `start_min`/`end_min` |
| Ids | UUID for operator content; stable slug for catalogue content |
| Auth | `Authorization: Bearer <token>`; only on `/admin/**` and `/me` |
| Pagination | `page` (1-based), `pageSize` (default 20, max 100) |
| Sorting | `sort=field:dir`, comma-separated, allow-listed per endpoint |
| Errors | RFC 9457 `application/problem+json` |
| Correlation | `X-Correlation-Id` echoed back; generated when absent |
| Caching | Public GETs send `ETag` + `Cache-Control: public, max-age=60, stale-while-revalidate=300` |

Bilingual values are one object, so a client never concatenates two requests to
render a page:

```json
{ "title": { "en": "The Night", "ar": "الليل" } }
```

## Errors

```json
{
  "type": "https://unified-control-center/errors/validation",
  "title": "Request validation failed",
  "status": 422,
  "detail": "2 fields failed validation.",
  "instance": "/api/v1/admin/movies",
  "code": "validation_failed",
  "errors": [
    { "field": "title.en", "code": "required", "message": "Title is required." },
    { "field": "runtime", "code": "range", "message": "Must be between 1 and 600." }
  ]
}
```

Stable machine `code` values: `unauthorized`, `forbidden`, `not_found`,
`conflict`, `validation_failed`, `rate_limited`, `upstream_unavailable`,
`internal`. Clients branch on `code`, never on `detail` text.

`502 upstream_unavailable` is only ever about ingestion, never about a user's
data — a read endpoint serves the last good cached value instead of failing.

## Public read endpoints

| Method & path | Returns | Notes |
| --- | --- | --- |
| `GET /api/v1/home` | `HomePayload` | Home view composed from the committed catalogue and managed content. |
| `GET /api/v1/movies` | `Paged<Movie>` | `status=now\|soon`, `genre`, `q`, `sort=title\|year\|rating\|release` |
| `GET /api/v1/movies/{id}` | `MovieDetail` | Catalogue id (slug) or operator UUID |
| `GET /api/v1/people/{id}` | `PersonDetail` | Filmography merged from works |
| `GET /api/v1/box-office` | `BoxOfficePayload` | Weekly + total + as-of date |
| `GET /api/v1/tv-guide` | `TvGuide` | `date=YYYY-MM-DD`; slots in minutes |
| `GET /api/v1/channels` | `Channel[]` | `category` filter |
| `GET /api/v1/videos` | `Paged<Video>` | Trailers and clips |
| `GET /api/v1/videos/{id}` | `VideoDetail` | |
| `GET /api/v1/vod` | `VodGuide` | Platforms + works per platform |
| `GET /api/v1/lineups` | `LineupIndex` | |
| `GET /api/v1/lineups/{id}` | `LineupDetail` | |
| `GET /api/v1/search` | `Paged<SearchResult>` | `q` required, ≥2 chars; searches both languages |
| `GET /api/v1/content` | `ManagedContent` | The one aggregate the dashboard and merge layer use today; kept so the frontend migration is one call |

Shapes match the frontend ports already written in
`elcinema/src/elcinema/home.shared.ts` and `live.shared.ts` — those files *are*
the client side of this contract today. Renaming a field there is a contract
change and needs an entry in [../CHANGELOG.md](../CHANGELOG.md).

### `Movie`

```json
{
  "id": "the-night",
  "source": "catalogue",
  "title": { "en": "The Night", "ar": "الليل" },
  "status": "now",
  "genre": { "key": "drama", "label": { "en": "Drama", "ar": "دراما" } },
  "year": 2026,
  "releaseDate": "2026-10-30",
  "rating": 7.4,
  "runtime": 118,
  "certificate": "PG13",
  "director": { "en": "…", "ar": "…" },
  "synopsis": { "en": "…", "ar": "…" },
  "poster": { "url": "https://…", "hue": 268 },
  "showtimes": [{ "cinema": { "en": "…", "ar": "…" }, "day": "2026-11-02", "times": ["18:00", "21:15"] }],
  "vod": null,
  "updatedAt": "2026-11-02T06:00:00Z"
}
```

`source` is `catalogue` or `managed` — the merge layer
([database.md](database.md#merge-rules)) uses it to decide precedence instead of
inferring it from an id prefix.

### `Paged<T>`

```json
{ "items": [], "page": 1, "pageSize": 20, "totalItems": 137, "totalPages": 7, "nextCursor": null }
```

## Auth

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v1/auth/login` | `{ email, password }` → `{ accessToken, refreshToken, expiresAt, user }` |
| `POST /api/v1/auth/refresh` | Rotate the access token |
| `POST /api/v1/auth/logout` | Revoke the refresh token |
| `GET /api/v1/me` | Current identity, roles and resolved permissions |

Self sign-up does not exist — operator accounts are provisioned, matching the
frontend's disabled sign-up. Passwords are never logged, and the login endpoint is
the only one behind a stricter rate limit.

Claims: `sub`, `email`, `role[]` (`viewer`, `editor`, `admin`), `perm[]`
(`content:write:movies`, `content:write:schedule`, …). Authorization checks
`perm`, not `role`, so permissions can be granted without a new enum.

## Admin endpoints

`/api/v1/admin/**` requires a bearer token and the matching permission.

| Method & path | Permission | Notes |
| --- | --- | --- |
| `GET/POST /api/v1/admin/movies`, `PUT/DELETE /…/{id}` | `content:write:movies` | Validated `MovieInput` |
| `GET/POST /api/v1/admin/people`, `PUT/DELETE /…/{id}` | `content:write:people` | |
| `GET/POST /api/v1/admin/box-office`, `PUT/DELETE /…/{id}` | `content:write:boxoffice` | |
| `GET/POST /api/v1/admin/channels`, `PUT/DELETE /…/{id}` | `content:write:schedule` | |
| `GET/POST /api/v1/admin/programs`, `PUT/DELETE /…/{id}` | `content:write:schedule` | Slot range validated server-side |
| `GET/POST /api/v1/admin/videos`, `PUT/DELETE /…/{id}` | `content:write:videos` | |
| `GET/POST /api/v1/admin/lists`, `PUT/DELETE /…/{id}` | `content:write:lists` | `items` is a typed array, not free JSON |
| `POST /api/v1/admin/artwork` | `content:write:movies` | Multipart upload → stored object + URL |
| `GET /api/v1/admin/audit` | `admin` | Who changed what, newest first |

Writes accept a **field DTO, never a raw row** — the API maps to columns, so a
typo in a client cannot become a silent no-op or an unexpected column write. Every
mutation records `actor`, `table`, `rowId`, `before`/`after` in the audit log.

## Internal operations

No content ingestion endpoint is part of this contract. Public content is served
from the committed catalogue and operator-managed records.

## Compatibility rules

1. Adding an optional field is not breaking. Removing, renaming, or re-typing one is.
2. A breaking change ships as `/api/v2`; `/api/v1` stays served during the overlap.
3. `code` values and `type` URIs are permanent vocabulary — extend, never repurpose.
4. The frontend keeps a fallback path for every API field it renders, so a partially
   degraded API still renders a page.
5. OpenAPI is generated, reviewed in the pull request, and published as the source
   for the TypeScript client. If the spec and this document disagree, this document
   is wrong and gets fixed.
