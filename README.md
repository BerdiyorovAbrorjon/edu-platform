# Edu Platform

Educational platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd edu-platform
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration if needed.

### 3. Start infrastructure services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5435`
- **MinIO** on port `9010` (API) and `9011` (Console)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth route group (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (admin)/          # Admin route group → /admin/*
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── courses/
│   │       └── users/
│   ├── (student)/        # Student route group → /student/*
│   │   └── student/
│   │       ├── dashboard/
│   │       ├── courses/
│   │       └── profile/
│   ├── api/              # API routes
│   │   ├── auth/
│   │   ├── courses/
│   │   └── users/
│   ├── globals.css
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── table.tsx
├── hooks/
└── lib/
    └── utils.ts          # cn() utility
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Infrastructure

| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL | 5435 | `postgres` / `postgres` |
| MinIO API | 9010 | `minioadmin` / `minioadmin` |
| MinIO Console | 9011 | `minioadmin` / `minioadmin` |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL 16
- **Object Storage**: MinIO (S3-compatible)
