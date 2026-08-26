# Agent Runbook

## Local setup

Install dependencies:

```bash
npm install
```

Run the app directly in dev mode:

```bash
npm run dev
```

Run database and object storage only:

```bash
docker compose up -d postgres minio
```

Run the full container stack:

```bash
docker compose up -d
```

Notes:

- full compose includes `migrate`, `app`, and `nginx`
- production-like entrypoint is nginx on port `81`
- local `next dev` defaults to port `3000`

## Database tasks

Prisma commands from `package.json`:

```bash
npm run db:migrate
npm run db:push
npm run db:seed
npm run db:studio
```

Build-time detail:

- Prisma client output path is `src/generated/prisma`
- Dockerfile explicitly runs `npx prisma generate` during build

## Environment variables

Core env file reference is `.env.example`.

Required groups:

- app URL: `NEXT_PUBLIC_APP_URL`
- auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- role bootstrap: `ADMIN_EMAILS`
- database: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`
- object storage: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET`

Container-only detail:

- in compose, app talks to MinIO using hostname `minio`
- internal MinIO API port is `9000`

## Common change points

Add or adjust auth/role behavior:

- `src/lib/auth.ts`
- `src/middleware.ts`
- `src/types/next-auth.d.ts`

Change lesson builder behavior:

- `src/components/admin/test-builder.tsx`
- `src/components/admin/lectures-manager.tsx`
- `src/components/admin/situational-qa-builder.tsx`
- `src/components/admin/file-upload.tsx`

Change student learning flow:

- `src/components/student/test-taker.tsx`
- `src/components/student/lectures-viewer.tsx`
- `src/components/student/situational-qa-viewer.tsx`
- `src/components/student/results-viewer.tsx`

Change analytics:

- `src/app/api/admin/analytics/route.ts`
- `src/app/(admin)/admin/analytics/page.tsx`

Change file/storage behavior:

- `src/lib/minio.ts`
- `src/lib/file-access.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/download/[fileId]/route.ts`

Change schema/data:

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `prisma/seed.ts`

## Validation path

There is no test suite in the repository yet.

Default verification path after code changes:

1. run `npm run build` for broad integration validation
2. run `npm run lint` if the lint script works in the current environment
3. manually exercise the affected role flow in browser or via API

## Operational cautions

- `prisma/seed.ts` is not generic seed data; it hardcodes one admin email and lesson content
- several docs in the repo are stale relative to code, so prefer code over prose
- some routes use bracketed path segments, so quote those paths in shell commands
- middleware protects route families, but most APIs still do explicit session/role checks in handlers
