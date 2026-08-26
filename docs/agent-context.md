# Agent Context

## Project shape

This is a Next.js 14 App Router learning platform with three product roles:

- `ADMIN`
- `TEACHER`
- `STUDENT`

The main product flow is a 4-step lesson journey:

1. Initial test
2. Lectures
3. Situational Q&A
4. Final test

Student progress is stored in `StudentProgress.currentStep` and finalized with `completedAt`.

## Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- NextAuth v4 + Google OAuth
- MinIO for file storage
- Recharts for analytics
- Tiptap for lecture rich text editing

## Route groups

App routes are split into route groups under `src/app`:

- `(auth)`: login and register
- `(admin)`: admin UI under `/admin/*`
- `(teacher)`: teacher UI under `/teacher/*`
- `(student)`: student UI under `/student/*`
- `api`: JSON/file endpoints

Important directories:

- `src/app/(admin)/admin/*`
- `src/app/(teacher)/teacher/*`
- `src/app/(student)/student/*`
- `src/app/api/*`
- `src/components/admin/*`
- `src/components/student/*`
- `src/lib/*`
- `prisma/*`

## Auth and authorization

Core auth config lives in `src/lib/auth.ts`.

Observed behavior:

- Sign-in uses Google OAuth only.
- Session strategy is JWT.
- First user becomes `ADMIN` if `ADMIN_EMAILS` is empty.
- If `ADMIN_EMAILS` is set, matching users are upgraded to `ADMIN` on sign-in.
- If a signed-in student email exists in `TeacherEmail`, that user is upgraded to `TEACHER`.

Route protection is centralized in `src/middleware.ts`.

Current access rules:

- `/admin/*`: admin only
- `/teacher/*`: teacher only
- `/student/*`: student only
- `/api/student/*`: student only
- `/api/admin/*`: admin or teacher
- `/api/admin/teacher-emails*`: admin only

Root behavior:

- `/` is public
- authenticated users are redirected by role from `/`

## Product flows

### Teacher flow

- Teacher creates lessons via `POST /api/lessons`
- Teacher edits a lesson through builder screens:
  - initial test
  - lectures
  - situational Q&A
  - final test
- Teacher sees only their own lessons in `GET /api/lessons`
- Teacher can access analytics, but teacher analytics are scoped to lessons they created

### Student flow

- Student opens lesson list
- Student starts with initial test
- Passing/finishing initial test moves progress to step `2`
- Lecture completion updates progress to step `3`
- Situational flow completion updates progress to step `4`
- Final test writes `completedAt`
- Results page compares initial vs final performance and shows situational answers

### Admin flow

- Admin manages teacher emails
- Admin can see all lessons
- Admin can view platform analytics

## Key API endpoints

Lesson management:

- `src/app/api/lessons/route.ts`
- `src/app/api/lessons/[id]/route.ts`
- `src/app/api/lessons/[id]/tests/initial/route.ts`
- `src/app/api/lessons/[id]/tests/final/route.ts`
- `src/app/api/lessons/[id]/lectures/route.ts`
- `src/app/api/lessons/[id]/situational/route.ts`
- `src/app/api/lessons/[id]/situational/[qaId]/route.ts`

Student flow:

- `src/app/api/student/lessons/route.ts`
- `src/app/api/student/lessons/[id]/progress/route.ts`
- `src/app/api/student/progress/update/route.ts`
- `src/app/api/student/tests/submit/route.ts`
- `src/app/api/student/situational/submit/route.ts`
- `src/app/api/student/lessons/[id]/results/route.ts`
- `src/app/api/student/lessons/[id]/restart/route.ts`

Admin and analytics:

- `src/app/api/admin/analytics/route.ts`
- `src/app/api/admin/analytics/lessons/route.ts`
- `src/app/api/admin/teacher-emails/route.ts`
- `src/app/api/admin/teacher-emails/[email]/route.ts`
- `src/app/api/admin/lessons/[id]/students/route.ts`
- `src/app/api/admin/lessons/[id]/students/[userId]/results/route.ts`

Files:

- `src/app/api/upload/route.ts`
- `src/app/api/download/[fileId]/route.ts`

Auth:

- `src/app/api/auth/[...nextauth]/route.ts`

## Data model summary

Main Prisma models in `prisma/schema.prisma`:

- `User`: auth identity + role
- `Lesson`: top-level learning unit
- `Test`: per-lesson initial/final JSON-based multiple choice test
- `Lecture`: ordered content block with rich HTML, video URL, and optional file reference
- `SituationalQA`: ordered scenario question with scored answer options
- `StudentProgress`: step tracker per user/lesson
- `TestResult`: stored test submissions and score
- `SituationalQAResult`: stored scenario choice and score
- `TeacherEmail`: allowlist used to assign teacher role
- `File`: uploaded asset metadata
- `FileDownload`: download audit trail

Prisma client is generated into `src/generated/prisma`.

## File handling

File upload/download behavior:

- Upload accepts selected document/image MIME types
- Upload stores binary in MinIO and metadata in `File`
- Download is streamed through the app server
- MinIO is kept internal in dockerized deployment
- Downloads are audit logged in `FileDownload`

Relevant files:

- `src/lib/minio.ts`
- `src/lib/file-access.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/download/[fileId]/route.ts`

## Infra snapshot

Current container topology from `docker-compose.yml`:

- `postgres`
- `minio`
- `migrate`
- `app`
- `nginx`

Important ports in current compose:

- app exposed through nginx on `81`
- postgres on `5432`
- MinIO console on `9001`
- MinIO S3 port is internal by default

## Files worth reading first in future sessions

- `package.json`
- `docker-compose.yml`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/auth.ts`
- `src/middleware.ts`
- `src/app/api/lessons/route.ts`
- `src/app/api/student/tests/submit/route.ts`
- `src/app/api/admin/analytics/route.ts`
- `src/app/(teacher)/teacher/lessons/page.tsx`
- `src/app/(admin)/admin/analytics/page.tsx`
