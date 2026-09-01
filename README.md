# fredyfatimawedding

Wedding invitation site and admin console. The full specification lives in `CLAUDE.md` at the repository root, which is the source of truth for this project.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

**`npm run dev` does not serve `/api/*`.** It's plain Vite, so it's fine for the invitation and for the admin login screen (Firebase Auth runs entirely client-side, no backend involved). But any request to `/api/*` — the guest list, create/edit/delete, the public invitation endpoint — hits Vite's own static file server instead of a real function. Vite happens to find `api/admin/guests.ts` on disk and serves its **raw, untranspiled source** as `200 text/javascript`, which looks like success in the Network tab but fails as soon as the client tries to parse it as JSON. If you see the admin console stuck on "no pudimos cargar" with a 200 in Network, this is almost always why.

To get a real local backend, use the Vercel CLI instead:

```bash
npx vercel link   # once per machine; interactive browser login, links to the existing fredyfatimawedding project
npx vercel dev     # serves the frontend AND api/* together, on localhost:3000 by default
```

Known quirk: `vercel dev` does **not** apply the custom response headers from `vercel.json` (e.g. the `Cache-Control: private, no-store` rule on `/api/*`) the way production does. Don't use `vercel dev` to verify caching-header behavior — that only reflects reality on a Preview deploy or production.

## Scripts

| Command                                                           | What it does                                                                                                                                                                                              |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                                     | Vite dev server on `localhost:5173`. Frontend only — see the note above for `/api/*`.                                                                                                                     |
| `npm run build`                                                   | Type-checks and builds to `dist/`                                                                                                                                                                         |
| `npm run lint`                                                    | ESLint, zero warnings tolerated                                                                                                                                                                           |
| `npm run lint:disables`                                           | Fails if lint suppressions exceed the budget of 10                                                                                                                                                        |
| `npm run typecheck`                                               | TypeScript with no emit                                                                                                                                                                                   |
| `npm run test`                                                    | Vitest once                                                                                                                                                                                               |
| `npm run test:coverage`                                           | Vitest with coverage thresholds enforced                                                                                                                                                                  |
| `npm run verify`                                                  | Everything above, in the order CI runs it                                                                                                                                                                 |
| `npm run import:guests -- <path-to-csv>`                          | Bulk-creates guests from a `firstName,lastName,titleLabel,guestLimit,phone` CSV. Aborts without writing anything if any row is invalid. Skips rows whose `phone` already exists, so it is safe to re-run. |
| `npm run normalize:guests -- <path-to-xlsx-or-csv> [output-path]` | Converts the couple's filled-in sheet (Spanish headers, loose phone formats) into the exact CSV `import:guests` expects. Validates every row first; writes nothing if any row fails.                      |

Collecting the real guest list: share the `.xlsx` handed to the couple (its header row must match `HUMAN_SHEET_HEADER` in `scripts/lib/humanGuestSheet.ts`) → `npm run normalize:guests -- <their file>` → `npm run import:guests -- <the file it printed>`.

Run `npm run verify` before opening a pull request. It is the same gate the CI uses.

## Layout

```
api/            Vercel serverless functions. The only place that touches Firestore.
api/_lib/       Shared server helpers. The only place where JSDoc is allowed.
src/schemas/    Zod schemas shared between the browser and api/.
src/components/ui/                 Invitation components. Uses the design tokens.
src/components/admin/              Console components. Uses shadcn/ui. Never imports from ui/.
src/components/admin/primitives/   Generated shadcn/Radix primitives (`shadcn add`). Vendored, not hand-styled.
src/components/admin/auth/         Firebase Auth client, login gate. The only place firebase/auth may be imported.
src/content/    Every user-facing Spanish string. Keys in English, values in Spanish.
scripts/        Maintenance scripts run with tsx.
types/          Ambient declarations for untyped dependencies.
```

## Rules the linter enforces

These are not style preferences. A pull request that breaks one of them does not merge.

- **Everything in English.** Identifiers, filenames, API routes, Firestore fields, CSS tokens, DOM anchors, environment variables, branch names, commit messages. Spanish appears only as values inside `src/content/`.
- **No comments.** The only exception is JSDoc on exported declarations inside `api/_lib/`. Rules live in ADRs; behaviour lives in test names.
- **No `any`, no `@ts-ignore`.** `@ts-expect-error` needs a description of at least 20 characters.
- **The browser never imports Firestore.** All data access goes through `api/`.
- **Firebase Auth is admin-console-only.** `firebase/auth` and `firebase/app` can only be imported from `src/components/admin/`; everywhere else (including `src/components/ui/`) it's an ESLint error, so the SDK never ends up in the invitation's bundle.
- **`ui/` and `admin/` never import each other.** They are two products that happen to share a repository.
- **Complexity 10, functions 50 lines, nesting 3, parameters 4.** More than three parameters go in an object.
- **Coverage: 90% in `api/` and `src/schemas/`, 60% overall.** Firebase credential bootstrap is excluded because testing it only tests the Firebase SDK. `src/components/admin/primitives/` is excluded for the same reason: it's generated shadcn/Radix code, not hand-written app logic.
- **`src/components/admin/primitives/` is exempt from the naming-convention and one-component-per-file rules.** It's regenerated with `shadcn add --overwrite` and kept close to upstream on purpose, so it isn't rewritten into this repo's arrow-function/PascalCase-only style. Nothing else in the codebase gets this exemption.
- **At most 10 lint suppressions in the whole repository.** Past that, fix the code or change the rule.

## Branches and commits

Conventional Commits in English: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.
Branches follow the ticket: `feat/WED-41-rsvp-endpoint`.
