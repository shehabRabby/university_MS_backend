# University Management API

Stage 1 backend foundation for a versioned University Management System REST API. It uses Node.js 24, Express 5, TypeScript, and Prisma 7 with PostgreSQL. No academic, identity, or payment business endpoints are included at this stage.

## Requirements

- Node.js 24 LTS and npm
- PostgreSQL for database readiness and future persistence; optional while developing Stage 1

## Setup

```sh
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`. The development server listens on port 3000 by default. Set `DATABASE_URL` in `.env` when a PostgreSQL database is available; without it, the server still starts, while `/health/ready` reports `503`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the TypeScript server with watch mode |
| `npm run build` | Generate Prisma Client and compile production JavaScript to `dist/` |
| `npm start` | Run the compiled production server |
| `npm run typecheck` | Generate Prisma Client and run strict TypeScript checks |
| `npm run lint` | Run Biome lint checks |
| `npm run format` | Format source and configuration files |
| `npm run format:check` | Check formatting without modifying files |
| `npm test` | Run Vitest and Supertest checks |
| `npm run prisma:generate` | Generate the Prisma client into `src/generated/prisma/` |
| `npm run prisma:validate` | Validate the multi-file Prisma schema |

`DATABASE_URL` is optional for client generation and schema validation. Database migration commands require a reachable PostgreSQL instance and a real connection string.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health/live` | Process liveness; does not use the database |
| `GET` | `/health/ready` | Readiness; returns `503` if PostgreSQL is not configured or reachable |
| — | `/api/v1` | Reserved namespace for future versioned modules; no business routes are defined yet |

Success responses use `{ "success": true, "message": "...", "data": ... }`. Errors use `{ "success": false, "message": "...", "errors": [] }`; readiness includes a dependency detail in `errors`.

The API applies Helmet security headers, a 1 MB JSON body limit, an origin allowlist, a global rate limit, generated `X-Request-ID` response headers, and Pino request/error logging. `CORS_ORIGIN` accepts a comma-separated list of origins. `PORT`, `NODE_ENV`, `CORS_ORIGIN`, and `LOG_LEVEL` are validated on startup.

## Structure

```text
src/
  server.ts
  app.ts
  app/
    config/index.ts
    lib/
      logger.ts
      prisma.ts
    middleware/
      globalErrorHandler.ts
      notFound.ts
      rateLimiter.ts
      requestContext.ts
    module/
      health/
        health.controller.ts
        health.route.ts
    utils/
      AppError.ts
      catchAsync.ts
      sendResponse.ts
  generated/prisma/       # generated; ignored by Git
prisma/
  schema/
    schema.prisma
    migrations/           # migration path configured for Prisma 7
tests/
```

Feature modules follow the reference project's route/controller/service/interface boundaries: routes register controllers, controllers handle HTTP input/output, and services own business logic and persistence. Add future modules under `src/app/module/<name>/` and mount their routers under `/api/v1` in `src/app.ts`. Keep Prisma access behind the shared client in `src/app/lib/prisma.ts`.

Prisma 7 loads the multi-file schema from `prisma/schema/`; migrations live at `prisma/schema/migrations/`, beside the schema file that defines the datasource. `DATABASE_URL` is loaded by `prisma.config.ts`. Generated client source is created automatically by the `build` and `typecheck` scripts and is not committed.

## Environment

Copy `.env.example` to `.env` and configure only what your environment needs. For database-backed readiness, provide a PostgreSQL URL such as:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/university_management?schema=public
```

Do not commit `.env` or place real credentials in `.env.example`.