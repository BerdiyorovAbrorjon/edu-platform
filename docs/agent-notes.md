# Agent Notes

## Current drift between docs and code

`README.md` is stale relative to `docker-compose.yml`:

- README says PostgreSQL is on `5435`; compose exposes `5432`
- README says MinIO API is on `9010`; compose keeps S3 internal by default
- README says MinIO console is on `9011`; compose uses `9001`
- README tells users to open port `3000`, while full compose exposes nginx on `81`

`PROGRESS.md` is also stale:

- it says authentication was skipped
- it does not reflect teacher role support
- it does not reflect download tracking and file access control
- it does not reflect current analytics implementation

## Product/code mismatches to resolve later

- `src/app/page.tsx` sends admins to `/admin/lessons`
- `src/middleware.ts` redirects admins from `/` to `/admin/analytics`

Pick one admin landing page and align both.

## Behavior to verify on next product pass

- `src/lib/file-access.ts` gives unconditional file access only to `ADMIN`
- `TEACHER` is not specially handled there

If teachers need to preview/download uploaded lesson files, current logic may be too strict.

## Other notable implementation details

- `src/lib/auth.ts` has `debug: true`, which is useful in development but noisy in production
- `prisma/seed.ts` upserts `lochin0207@gmail.com` as admin, which is environment-specific
- uploads currently allow a curated list of documents and images, max `50MB`
- file downloads are streamed through the app instead of exposing MinIO directly

## Safe assumptions for future sessions

- this repo is already beyond the state described in `PROGRESS.md`
- the real source of truth is the current code under `src/app`, `src/lib`, and `prisma`
- teacher and admin features share some API surface, but role scoping is enforced server-side
