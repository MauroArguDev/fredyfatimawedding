# fredyfatimawedding

Wedding invitation site and admin console. The full specification lives in `CLAUDE.md` at the repository root, which is the source of truth for this project.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Command                                                           | What it does                                                                                                                                                                                              |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                                     | Vite dev server on `localhost:5173`                                                                                                                                                                       |
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
- **`ui/` and `admin/` never import each other.** They are two products that happen to share a repository.
- **Complexity 10, functions 50 lines, nesting 3, parameters 4.** More than three parameters go in an object.
- **Coverage: 90% in `api/` and `src/schemas/`, 60% overall.** Firebase credential bootstrap is excluded because testing it only tests the Firebase SDK. `src/components/admin/primitives/` is excluded for the same reason: it's generated shadcn/Radix code, not hand-written app logic.
- **`src/components/admin/primitives/` is exempt from the naming-convention and one-component-per-file rules.** It's regenerated with `shadcn add --overwrite` and kept close to upstream on purpose, so it isn't rewritten into this repo's arrow-function/PascalCase-only style. Nothing else in the codebase gets this exemption.
- **At most 10 lint suppressions in the whole repository.** Past that, fix the code or change the rule.

## Branches and commits

Conventional Commits in English: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.
Branches follow the ticket: `feat/WED-41-rsvp-endpoint`.
